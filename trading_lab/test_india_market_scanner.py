import csv, tempfile, unittest, json, io, contextlib, sys
from pathlib import Path
from unittest.mock import patch
from india_market_scanner import load_bars, analyse_symbol, scan, sma, rsi14, main

class ScannerTests(unittest.TestCase):
    def make_csv(self, rows):
        tmp=tempfile.NamedTemporaryFile(mode="w",newline="",suffix=".csv",delete=False,encoding="utf-8")
        writer=csv.writer(tmp); writer.writerow(["symbol","timestamp","open","high","low","close","volume"]); writer.writerows(rows); tmp.close()
        self.addCleanup(lambda: Path(tmp.name).unlink(missing_ok=True))
        return tmp.name

    def rows(self,n=55):
        return [["RELIANCE",f"2026-01-{(i%28)+1:02d}T09:15:00+05:30",100+i,102+i,99+i,101+i,1000+(i*20)] for i in range(n)]

    def test_scan_marks_historical_not_live(self):
        # Use unique ISO dates across consecutive months.
        rows=[]
        from datetime import date,timedelta
        start=date(2026,1,1)
        for i in range(55):
            d=start+timedelta(days=i)
            c=100+i
            rows.append(["RELIANCE",d.isoformat()+"T09:15:00+05:30",c-1,c+1,c-2,c,1000+i*20])
        result=scan(self.make_csv(rows))
        self.assertFalse(result["live_data"])
        self.assertEqual(result["mode"],"OFFLINE_HISTORICAL_CSV")
        self.assertEqual(result["symbols_scanned"],1)
        self.assertEqual(result["results"][0]["symbol"],"RELIANCE")

    def test_invalid_ohlc_rejected(self):
        path=self.make_csv([["TCS","2026-01-01T09:15:00+05:30",100,99,98,101,1000]])
        with self.assertRaises(ValueError): load_bars(path)

    def test_duplicate_timestamp_rejected(self):
        rows=[["INFY","2026-01-01T09:15:00+05:30",100,102,99,101,1000]]*2
        with self.assertRaises(ValueError): scan(self.make_csv(rows))

    def test_insufficient_history_has_no_sma_or_rsi(self):
        from india_market_scanner import Bar
        from datetime import datetime,timezone,timedelta
        bars=[Bar("ABC",datetime(2026,1,1,tzinfo=timezone.utc)+timedelta(days=i),10+i,11+i,9+i,10+i,100) for i in range(10)]
        result=analyse_symbol(bars)
        self.assertIsNone(result["sma20"])
        self.assertIsNone(result["sma50"])
        self.assertIsNone(result["rsi14"])

    def test_sma_direct_period_and_insufficient_history(self):
        self.assertIsNone(sma([1.0,2.0],3))
        self.assertEqual(sma([1.0,2.0,3.0,4.0],3),3.0)

    def test_rsi14_direct_rising_falling_and_flat_series(self):
        self.assertEqual(rsi14([float(i) for i in range(15)]),100.0)
        self.assertEqual(rsi14([float(15-i) for i in range(15)]),0.0)
        self.assertEqual(rsi14([10.0]*15),50.0)
        self.assertIsNone(rsi14([1.0]*14))

    def test_cli_main_writes_json_output(self):
        rows=[]
        from datetime import date,timedelta
        start=date(2026,1,1)
        for i in range(55):
            d=start+timedelta(days=i); c=100+i
            rows.append(["RELIANCE",d.isoformat()+"T09:15:00+05:30",c-1,c+1,c-2,c,1000+i*20])
        csv_path=self.make_csv(rows)
        with tempfile.TemporaryDirectory() as folder:
            out_path=str(Path(folder)/"scan.json")
            stdout=io.StringIO()
            with patch.object(sys,"argv",["india_market_scanner","--csv",csv_path,"--out",out_path]), contextlib.redirect_stdout(stdout):
                main()
            self.assertEqual(json.loads(stdout.getvalue())["mode"],"OFFLINE_HISTORICAL_CSV")
            self.assertEqual(json.loads(Path(out_path).read_text(encoding="utf-8"))["symbols_scanned"],1)

if __name__=="__main__": unittest.main()
