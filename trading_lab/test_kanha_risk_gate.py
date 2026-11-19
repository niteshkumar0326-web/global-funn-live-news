import unittest
from decimal import Decimal
from kanha_risk_gate import _positive, evaluate_candidate, validate_daily_plan

class KanhaRiskGateTests(unittest.TestCase):
    def candidate(self,**overrides):
        base={"mode":"INTRADAY","capital":"1200","entry":"100","stop":"98","target":"105","fee_per_order":"5","risk_fraction":"0.01"}
        base.update(overrides); return base

    def test_quantity_respects_risk_and_cash(self):
        result=evaluate_candidate(self.candidate())
        self.assertEqual(result["quantity"],6)
        self.assertEqual(result["status"],"PASS_FOR_REVIEW")

    def test_fees_can_make_target_net_negative(self):
        result=evaluate_candidate(self.candidate(entry="100",stop="99.9",target="100.1",fee_per_order="10"))
        self.assertEqual(result["status"],"REJECT")

    def test_daily_plan_accepts_one_of_each(self):
        result=validate_daily_plan([self.candidate(mode="DELIVERY"),self.candidate(mode="INTRADAY")])
        self.assertEqual(result["status"],"PASS")

    def test_daily_plan_rejects_three_trades(self):
        result=validate_daily_plan([self.candidate(),self.candidate(mode="DELIVERY"),self.candidate(mode="INTRADAY")])
        self.assertEqual(result["status"],"REJECT")

    def test_daily_plan_rejects_duplicate_mode(self):
        result=validate_daily_plan([self.candidate(),self.candidate()])
        self.assertEqual(result["status"],"REJECT")

    def test_invalid_prices_rejected(self):
        with self.assertRaises(ValueError): evaluate_candidate(self.candidate(stop="101"))

    def test_positive_value_guard_rejects_zero_capital(self):
        with self.assertRaisesRegex(ValueError,"capital must be positive"):
            evaluate_candidate(self.candidate(capital="0"))

    def test_positive_helper_accepts_positive_decimal(self):
        self.assertEqual(_positive("12.50","capital"),Decimal("12.50"))

    def test_positive_helper_rejects_zero_and_negative(self):
        for value in ("0","-0.01"):
            with self.subTest(value=value), self.assertRaisesRegex(ValueError,"capital must be positive"):
                _positive(value,"capital")

if __name__=="__main__": unittest.main()
