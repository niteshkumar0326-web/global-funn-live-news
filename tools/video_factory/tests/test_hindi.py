from factory.hindi import num_to_hi_words, speakable, split_sentences, srt_time


def test_numbers():
    assert num_to_hi_words(0) == "शून्य"
    assert num_to_hi_words(83) == "तिरासी"
    assert num_to_hi_words(720) == "सात सौ बीस"
    assert num_to_hi_words(83919) == "तिरासी हज़ार नौ सौ उन्नीस"
    assert num_to_hi_words(100000) == "एक लाख"
    assert num_to_hi_words(12345678) == "एक करोड़ तेईस लाख पैंतालीस हज़ार छह सौ अठहत्तर"


def test_speakable_digits_commas_decimals_percent():
    assert "83,919" not in speakable("सेंसेक्स 83,919.71")
    assert speakable("तिरासी हज़ार") == "तिरासी हज़ार"
    s = speakable("बढ़त 2.85% रही")
    assert "दशमलव" in s and "प्रतिशत" in s and "%" not in s
    assert speakable("ANI के अनुसार") == "ए एन आई के अनुसार"
    assert "720" not in speakable("720/9 पर")


def test_split_and_srt():
    assert split_sentences("एक। दो! तीन? चार") == ["एक।", "दो!", "तीन?", "चार"]
    assert srt_time(3661.5) == "01:01:01,500"
