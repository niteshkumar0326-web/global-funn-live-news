import unittest, tempfile, json, io, contextlib, sys
from pathlib import Path
from decimal import Decimal as D
from unittest.mock import patch

from paper_engine import Candle, TradePlan, size_position, simulate, read_candles, main


class PaperEngineTests(unittest.TestCase):
    def plan(self, **overrides):
        values = dict(capital=D("10000"), entry=D("100"), stop=D("95"), target=D("110"),
                      risk_fraction=D("0.01"), fee_per_order=D("5"), slippage_bps=D("0"))
        values.update(overrides)
        return TradePlan(**values)

    def test_position_size_uses_risk_and_cash_caps(self):
        result = size_position(self.plan())
        self.assertEqual(result["quantity"], 20)
        self.assertEqual(result["planned_price_risk"], "100")

    def test_stop_first_when_both_stop_and_target_touch(self):
        result = simulate(self.plan(), [
            Candle("2026-01-01", D("100"), D("111"), D("94"), D("99"))
        ])
        self.assertEqual(result["exit_reason"], "STOP")
        self.assertEqual(result["net_pnl"], "-110")

    def test_target_exit(self):
        result = simulate(self.plan(), [
            Candle("2026-01-01", D("100"), D("111"), D("99"), D("108"))
        ])
        self.assertEqual(result["exit_reason"], "TARGET")
        self.assertEqual(result["net_pnl"], "190")

    def test_stop_gap_fills_at_open(self):
        result = simulate(self.plan(), [
            Candle("2026-01-01", D("92"), D("94"), D("90"), D("93"))
        ])
        self.assertEqual(result["exit_fill"], "92")
        self.assertEqual(result["exit_reason"], "STOP")

    def test_invalid_long_plan_rejected(self):
        with self.assertRaises(ValueError):
            size_position(self.plan(stop=D("101")))

    def test_cannot_afford_one_share_with_risk_cap(self):
        result = simulate(self.plan(capital=D("100"), risk_fraction=D("0.01")), [])
        self.assertEqual(result["status"], "REJECTED")

    def test_trade_plan_dataclass_defaults_and_decimal_fields(self):
        plan = TradePlan(capital=D("1200"), entry=D("100"), stop=D("98"), target=D("105"))
        self.assertEqual(plan.risk_fraction, D("0.01"))
        self.assertEqual(plan.fee_per_order, D("0"))
        self.assertEqual(plan.slippage_bps, D("0"))

    def test_read_candles_loads_csv_and_rejects_missing_columns(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/"candles.csv"
            path.write_text("timestamp,open,high,low,close\n2026-01-01,100,105,99,104\n",encoding="utf-8")
            candles=read_candles(str(path))
            self.assertEqual(len(candles),1)
            self.assertEqual(candles[0].close,D("104"))
            path.write_text("timestamp,open,high,low\n2026-01-01,100,105,99\n",encoding="utf-8")
            with self.assertRaisesRegex(ValueError,"CSV needs"):
                read_candles(str(path))

    def test_cli_main_runs_plan_and_candle_files(self):
        with tempfile.TemporaryDirectory() as folder:
            plan_path=Path(folder)/"plan.json"
            candles_path=Path(folder)/"candles.csv"
            plan_path.write_text(json.dumps({"capital":"10000","entry":"100","stop":"95","target":"110","fee_per_order":"5"}),encoding="utf-8")
            candles_path.write_text("timestamp,open,high,low,close\n2026-01-01,100,111,99,108\n",encoding="utf-8")
            stdout=io.StringIO()
            with patch.object(sys,"argv",["paper_engine","--plan",str(plan_path),"--candles",str(candles_path)]), contextlib.redirect_stdout(stdout):
                main()
            result=json.loads(stdout.getvalue())
            self.assertEqual(result["status"],"SIMULATED")
            self.assertEqual(result["exit_reason"],"TARGET")


if __name__ == "__main__":
    unittest.main()
