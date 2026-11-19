import unittest
from decimal import Decimal as D

from paper_engine import Candle, TradePlan, size_position, simulate


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


if __name__ == "__main__":
    unittest.main()
