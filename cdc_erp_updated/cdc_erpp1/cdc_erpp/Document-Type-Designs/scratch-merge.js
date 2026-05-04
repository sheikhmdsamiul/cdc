const fs = require('fs');

const bnData = {
  "ঢাকা বিভাগ": {
    "ঢাকা জেলা": [
      "ধামরাই উপজেলা",
      "দোহার উপজেলা",
      "কেরাণীগঞ্জ উপজেলা",
      "নবাবগঞ্জ উপজেলা",
      "সাভার উপজেলা"
    ],
    "ফরিদপুর জেলা": [
      "আলফাডাঙ্গা উপজেলা",
      "ভাঙ্গা উপজেলা",
      "বোয়ালমারী উপজেলা",
      "চরভদ্রাসন উপজেলা",
      "ফরিদপুর সদর উপজেলা",
      "মধুখালী উপজেলা",
      "নগরকান্দা উপজেলা",
      "সদরপুর উপজেলা",
      "সালথা উপজেলা"
    ],
    "গাজীপুর জেলা": [
      "গাজীপুর সদর উপজেলা",
      "কালিয়াকৈর উপজেলা",
      "কালীগঞ্জ উপজেলা",
      "কাপাসিয়া উপজেলা",
      "শ্রীপুর উপজেলা"
    ],
    "গোপালগঞ্জ জেলা": [
      "গোপালগঞ্জ সদর উপজেলা",
      "কাশিয়ানী উপজেলা",
      "কোটালীপাড়া উপজেলা",
      "মুকসুদপুর উপজেলা",
      "টুঙ্গিপাড়া উপজেলা"
    ],
    "কিশোরগঞ্জ জেলা": [
      "অষ্টগ্রাম উপজেলা",
      "বাজিতপুর উপজেলা",
      "ভৈরব উপজেলা",
      "হোসেনপুর উপজেলা",
      "ইটনা উপজেলা",
      "করিমগঞ্জ উপজেলা",
      "কটিয়াদী উপজেলা",
      "কিশোরগঞ্জ সদর উপজেলা",
      "কুলিয়ারচর উপজেলা",
      "মিঠামইন উপজেলা",
      "নিকলী উপজেলা",
      "পাকুন্দিয়া উপজেলা",
      "তাড়াইল উপজেলা"
    ],
    "মাদারীপুর জেলা": [
      "কালকিনি উপজেলা",
      "মাদারীপুর সদর উপজেলা",
      "রাজৈর উপজেলা",
      "শিবচর উপজেলা",
      "ডাসার উপজেলা"
    ],
    "মানিকগঞ্জ জেলা": [
      "দৌলতপুর উপজেলা",
      "ঘিওর উপজেলা",
      "হরিরামপুর উপজেলা",
      "মানিকগঞ্জ সদর উপজেলা",
      "সাটুরিয়া উপজেলা",
      "শিবালয় উপজেলা",
      "সিংগাইর উপজেলা"
    ],
    "মুন্সীগঞ্জ জেলা": [
      "গজারিয়া উপজেলা",
      "লৌহজং উপজেলা",
      "মুন্সীগঞ্জ সদর উপজেলা",
      "সিরাজদিখান উপজেলা",
      "শ্রীনগর উপজেলা",
      "টংগিবাড়ী উপজেলা"
    ],
    "নারায়ণগঞ্জ জেলা": [
      "আড়াইহাজার উপজেলা",
      "সোনারগাঁ উপজেলা",
      "নারায়নগঞ্জ সদর উপজেলা",
      "রূপগঞ্জ উপজেলা",
      "বন্দর উপজেলা"
    ],
    "নরসিংদী জেলা": [
      "বেলাবো উপজেলা",
      "মনোহরদী উপজেলা",
      "নরসিংদী সদর",
      "পলাশ উপজেলা",
      "রায়পুরা উপজেলা",
      "শিবপুর উপজেলা"
    ],
    "রাজবাড়ী জেলা": [
      "বালিয়াকান্দি উপজেলা",
      "গোয়ালন্দ উপজেলা",
      "কালুখালী উপজেলা",
      "পাংশা উপজেলা",
      "রাজবাড়ী সদর উপজেলা"
    ],
    "শরীয়তপুর জেলা": [
      "ভেদরগঞ্জ উপজেলা",
      "ডামুড্যা উপজেলা",
      "গোসাইরহাট উপজেলা",
      "নড়িয়া উপজেলা",
      "শরীয়তপুর সদর উপজেলা",
      "জাজিরা উপজেলা"
    ],
    "টাঙ্গাইল জেলা": [
      "বাসাইল উপজেলা",
      "ভূঞাপুর উপজেলা",
      "দেলদুয়ার উপজেলা",
      "ধনবাড়ী উপজেলা",
      "ঘাটাইল উপজেলা",
      "গোপালপুর উপজেলা",
      "কালিহাতী উপজেলা",
      "মধুপুর উপজেলা",
      "মির্জাপুর উপজেলা",
      "নাগরপুর উপজেলা",
      "সখিপুর উপজেলা",
      "টাঙ্গাইল সদর উপজেলা"
    ]
  },
  "খুলনা বিভাগ": {
    "বাগেরহাট জেলা": [
      "চিতলমারী উপজেলা",
      "ফকিরহাট উপজেলা",
      "কচুয়া উপজেলা",
      "মোল্লাহাট উপজেলা",
      "মোংলা উপজেলা",
      "মোরেলগঞ্জ উপজেলা",
      "রামপাল উপজেলা",
      "শরণখোলা উপজেলা",
      "বাগেরহাট সদর উপজেলা"
    ],
    "চুয়াডাঙ্গা জেলা": [
      "আলমডাঙ্গা উপজেলা",
      "চুয়াডাঙ্গা সদর উপজেলা",
      "দামুড়হুদা উপজেলা",
      "জীবননগর উপজেলা"
    ],
    "যশোর জেলা": [
      "অভয়নগর উপজেলা",
      "বাঘারপাড়া উপজেলা",
      "চৌগাছা উপজেলা",
      "ঝিকরগাছা উপজেলা",
      "কেশবপুর উপজেলা",
      "যশোর সদর উপজেলা",
      "মণিরামপুর উপজেলা",
      "শারশা উপজেলা"
    ],
    "ঝিনাইদহ জেলা": [
      "হরিণাকুন্ডু উপজেলা",
      "ঝিনাইদহ সদর উপজেলা",
      "কালীগঞ্জ উপজেলা",
      "কোটচাঁদপুর উপজেলা",
      "মহেশপুর উপজেলা",
      "শৈলকুপা উপজেলা"
    ],
    "খুলনা জেলা": [
      "বটিয়াঘাটা উপজেলা",
      "দাকোপ উপজেলা",
      "ডুমুরিয়া উপজেলা",
      "কয়রা উপজেলা",
      "পাইকগাছা উপজেলা",
      "ফুলতলা উপজেলা",
      "রূপসা উপজেলা",
      "তেরখাদা উপজেলা",
      "দিঘলিয়া উপজেলা"
    ],
    "কুষ্টিয়া জেলা": [
      "ভেড়ামারা উপজেলা",
      "দৌলতপুর উপজেলা",
      "খোকসা উপজেলা",
      "কুমারখালী উপজেলা",
      "কুষ্টিয়া সদর উপজেলা",
      "মিরপুর উপজেলা"
    ],
    "মাগুরা জেলা": [
      "মাগুরা সদর উপজেলা",
      "মহম্মদপুর উপজেলা",
      "শালিখা উপজেলা",
      "শ্রীপুর উপজেলা"
    ],
    "মেহেরপুর জেলা": [
      "গাংনী উপজেলা",
      "মুজিবনগর উপজেলা",
      "মেহেরপুর সদর উপজেলা"
    ],
    "নড়াইল জেলা": [
      "কালিয়া উপজেলা",
      "লোহাগড়া উপজেলা",
      "নড়াইল সদর উপজেলা"
    ],
    "সাতক্ষীরা জেলা": [
      "আশাশুনি উপজেলা",
      "দেবহাটা উপজেলা",
      "কলারোয়া উপজেলা",
      "কালিগঞ্জ উপজেলা",
      "সাতক্ষীরা সদর উপজেলা",
      "শ্যামনগর উপজেলা",
      "তালা উপজেলা"
    ]
  },
  "চট্টগ্রাম বিভাগ": {
    "বান্দরবান জেলা": [
      "আলীকদম উপজেলা",
      "বান্দরবান সদর উপজেলা",
      "লামা উপজেলা",
      "নাইক্ষ্যংছড়ি উপজেলা",
      "রোয়াংছড়ি উপজেলা",
      "রুমা উপজেলা",
      "থানচি উপজেলা"
    ],
    "ব্রাহ্মণবাড়িয়া জেলা": [
      "আখাউড়া উপজেলা",
      "বাঞ্ছারামপুর উপজেলা",
      "বিজয়নগর উপজেলা",
      "ব্রাহ্মণবাড়িয়া সদর উপজেলা",
      "আশুগঞ্জ উপজেলা",
      "কসবা উপজেলা",
      "নবীনগর উপজেলা",
      "নাসিরনগর উপজেলা",
      "সরাইল উপজেলা"
    ],
    "চাঁদপুর জেলা": [
      "চাঁদপুর সদর উপজেলা",
      "ফরিদগঞ্জ উপজেলা",
      "হাইমচর উপজেলা",
      "হাজীগঞ্জ উপজেলা",
      "কচুয়া উপজেলা",
      "মতলব দক্ষিণ",
      "মতলব উত্তর",
      "শাহরাস্তি উপজেলা"
    ],
    "চট্টগ্রাম জেলা": [
      "আনোয়ারা উপজেলা",
      "বাঁশখালী উপজেলা",
      "বোয়ালখালী উপজেলা",
      "চন্দনাইশ উপজেলা",
      "ফটিকছড়ি উপজেলা",
      "হাটহাজারী উপজেলা",
      "লোহাগাড়া উপজেলা",
      "মীরসরাই উপজেলা",
      "পটিয়া উপজেলা",
      "রাঙ্গুনিয়া উপজেলা",
      "রাউজান উপজেলা",
      "সন্দ্বীপ উপজেলা",
      "সাতকানিয়া উপজেলা",
      "সীতাকুন্ড উপজেলা",
      "কর্ণফুলী উপজেলা"
    ],
    "কুমিল্লা জেলা": [
      "বরুড়া উপজেলা",
      "ব্রাহ্মণপাড়া উপজেলা",
      "বুড়িচং উপজেলা",
      "চান্দিনা উপজেলা",
      "চৌদ্দগ্রাম উপজেলা",
      "আদর্শ সদর উপজেলা",
      "সদর দক্ষিণ উপজেলা",
      "দাউদকান্দি উপজেলা",
      "দেবিদ্বার উপজেলা",
      "হোমনা উপজেলা",
      "লাকসাম উপজেলা",
      "মনোহরগঞ্জ উপজেলা",
      "মেঘনা উপজেলা",
      "মুরাদনগর উপজেলা",
      "নাঙ্গলকোট উপজেলা",
      "তিতাস উপজেলা",
      "লালমাই উপজেলা"
    ],
    "কক্সবাজার জেলা": [
      "চকরিয়া উপজেলা",
      "কক্সবাজার সদর উপজেলা",
      "কুতুবদিয়া উপজেলা",
      "মহেশখালী উপজেলা",
      "পেকুয়া উপজেলা",
      "রামু উপজেলা",
      "টেকনাফ উপজেলা",
      "উখিয়া উপজেলা",
      "ঈদগাঁও উপজেলা"
    ],
    "ফেনী জেলা": [
      "ছাগলনাইয়া উপজেলা",
      "দাগনভূঞা উপজেলা",
      "ফেনী সদর উপজেলা",
      "ফুলগাজী উপজেলা",
      "পরশুরাম উপজেলা",
      "সোনাগাজী উপজেলা"
    ],
    "খাগড়াছড়ি জেলা": [
      "দীঘিনালা উপজেলা",
      "মানিকছড়ি উপজেলা",
      "খাগড়াছড়ি সদর উপজেলা",
      "লক্ষীছড়ি উপজেলা",
      "মহালছড়ি উপজেলা",
      "মাটিরাঙ্গা উপজেলা",
      "পানছড়ি উপজেলা",
      "রামগড় উপজেলা",
      "গুইমারা উপজেলা"
    ],
    "লক্ষ্মীপুর জেলা": [
      "কমলনগর উপজেলা",
      "লক্ষ্মীপুর সদর উপজেলা",
      "রায়পুর উপজেলা",
      "রামগঞ্জ উপজেলা",
      "রামগতি উপজেলা"
    ],
    "নোয়াখালী জেলা": [
      "বেগমগঞ্জ উপজেলা",
      "চাটখিল উপজেলা",
      "কোম্পানীগঞ্জ উপজেলা",
      "হাতিয়া উপজেলা",
      "সেনবাগ উপজেলা",
      "সোনাইমুড়ী উপজেলা",
      "সুবর্ণচর উপজেলা",
      "নোয়াখালী সদর",
      "কবিরহাট উপজেলা"
    ],
    "রাঙ্গামাটি জেলা": [
      "বাঘাইছড়ি উপজেলা",
      "বরকল উপজেলা",
      "কাউখালী উপজেলা",
      "কাপ্তাই উপজেলা",
      "জুরাছড়ি উপজেলা",
      "লংগদু উপজেলা",
      "নানিয়ারচর উপজেলা",
      "রাঙ্গামাটি সদর উপজেলা",
      "রাজস্থলী উপজেলা",
      "বিলাইছড়ি উপজেলা"
    ]
  },
  "রাজশাহী বিভাগ": {
    "বগুড়া জেলা": [
      "আদমদিঘি উপজেলা",
      "বগুড়া সদর উপজেলা",
      "ধুনট উপজেলা",
      "দুপচাচিঁয়া উপজেলা",
      "গাবতলী উপজেলা",
      "কাহালু উপজেলা",
      "নন্দিগ্রাম উপজেলা",
      "সারিয়াকান্দি উপজেলা",
      "শাজাহানপুর উপজেলা",
      "শেরপুর উপজেলা",
      "শিবগঞ্জ উপজেলা",
      "সোনাতলা উপজেলা"
    ],
    "জয়পুরহাট জেলা": [
      "আক্কেলপুর উপজেলা",
      "জয়পুরহাট সদর উপজেলা",
      "কালাই উপজেলা",
      "পাঁচবিবি উপজেলা",
      "ক্ষেতলাল উপজেলা"
    ],
    "নওগাঁ জেলা": [
      "আত্রাই উপজেলা",
      "ধামইরহাট উপজেলা",
      "মান্দা উপজেলা",
      "মহাদেবপুর উপজেলা",
      "নওগাঁ সদর উপজেলা",
      "নিয়ামতপুর উপজেলা",
      "পত্নীতলা উপজেলা",
      "রাণীনগর উপজেলা",
      "সাপাহার উপজেলা",
      "বদলগাছী উপজেলা",
      "পোরশা উপজেলা"
    ],
    "নাটোর জেলা": [
      "বাগাতিপাড়া উপজেলা",
      "বড়াইগ্রাম উপজেলা",
      "গুরুদাসপুর উপজেলা",
      "লালপুর উপজেলা",
      "নাটোর সদর উপজেলা",
      "সিংড়া উপজেলা",
      "নলডাঙ্গা উপজেলা"
    ],
    "চাঁপাইনবাবগঞ্জ জেলা": [
      "শিবগঞ্জ উপজেলা",
      "ভোলাহাট উপজেলা",
      "গোমস্তাপুর উপজেলা",
      "নাচোল উপজেলা",
      "চাঁপাইনবাবগঞ্জ সদর উপজেলা"
    ],
    "পাবনা জেলা": [
      "আটঘরিয়া উপজেলা",
      "বেড়া উপজেলা",
      "ভাঙ্গুড়া উপজেলা",
      "চাটমোহর উপজেলা",
      "ফরিদপুর উপজেলা",
      "ঈশ্বরদী উপজেলা",
      "পাবনা সদর উপজেলা",
      "সাঁথিয়া উপজেলা",
      "সুজানগর উপজেলা"
    ],
    "রাজশাহী জেলা": [
      "বাঘা উপজেলা",
      "বাগমারা উপজেলা",
      "চারঘাট উপজেলা",
      "দুর্গাপুর উপজেলা",
      "গোদাগাড়ী উপজেলা",
      "মোহনপুর উপজেলা",
      "পবা উপজেলা",
      "পুঠিয়া উপজেলা",
      "তানোর উপজেলা"
    ],
    "সিরাজগঞ্জ জেলা": [
      "বেলকুচি উপজেলা",
      "চৌহালি উপজেলা",
      "কামারখন্দ উপজেলা",
      "কাজীপুর উপজেলা",
      "রায়গঞ্জ উপজেলা",
      "শাহজাদপুর উপজেলা",
      "সিরাজগঞ্জ সদর",
      "তাড়াশ উপজেলা",
      "উল্লাপাড়া উপজেলা"
    ]
  },
  "সিলেট বিভাগ": {
    "হবিগঞ্জ জেলা": [
      "আজমিরীগঞ্জ উপজেলা",
      "বাহুবল উপজেলা",
      "বানিয়াচং উপজেলা",
      "চুনারুঘাট উপজেলা",
      "হবিগঞ্জ সদর উপজেলা",
      "লাখাই উপজেলা",
      "মাধবপুর উপজেলা",
      "নবীগঞ্জ উপজেলা",
      "শায়েস্তাগঞ্জ উপজেলা",
      "শায়েস্তাগঞ্জ উপজেলা"
    ],
    "مৌলভীবাজার জেলা": [
      "বড়লেখা উপজেলা",
      "জুড়ী উপজেলা",
      "কমলগঞ্জ উপজেলা",
      "কুলাউড়া উপজেলা",
      "মৌলভীবাজার সদর উপজেলা",
      "রাজনগর উপজেলা",
      "শ্রীমঙ্গল উপজেলা"
    ],
    "সুনামগঞ্জ জেলা": [
      "বিশ্বম্ভরপুর উপজেলা",
      "ছাতক উপজেলা",
      "দিরাই উপজেলা",
      "ধর্মপাশা উপজেলা",
      "দোয়ারাবাজার উপজেলা",
      "জগন্নাথপুর উপজেলা",
      "জামালগঞ্জ উপজেলা",
      "শাল্লা উপজেলা",
      "সুনামগঞ্জ সদর উপজেলা",
      "তাহিরপুর উপজেলা",
      "শান্তিগঞ্জ উপজেলা",
      "মধ্যনগর উপজেলা"
    ],
    "সিলেট জেলা": [
      "বালাগঞ্জ উপজেলা",
      "বিয়ানীবাজার উপজেলা",
      "বিশ্বনাথ উপজেলা",
      "কোম্পানীগঞ্জ উপজেলা",
      "দক্ষিণ সুরমা উপজেলা",
      "ফেঞ্চুগঞ্জ উপজেলা",
      "গোলাপগঞ্জ উপজেলা",
      "গোয়াইনঘাট উপজেলা",
      "জৈন্তাপুর উপজেলা",
      "কানাইঘাট উপজেলা",
      "সিলেট সদর উপজেলা",
      "জকিগঞ্জ উপজেলা",
      "ওসমানী নগর উপজেলা"
    ]
  },
  "রংপুর বিভাগ": {
    "দিনাজপুর জেলা": [
      "বিরামপুর উপজেলা",
      "বীরগঞ্জ উপজেলা",
      "বিরল উপজেলা",
      "বোচাগঞ্জ উপজেলা",
      "চিরিরবন্দর উপজেলা",
      "ফুলবাড়ী উপজেলা",
      "ঘোড়াঘাট উপজেলা",
      "হাকিমপুর উপজেলা",
      "কাহারোল উপজেলা",
      "খানসামা উপজেলা",
      "নবাবগঞ্জ উপজেলা",
      "পার্বতীপুর উপজেলা",
      "দিনাজপুর সদর উপজেলা"
    ],
    "গাইবান্ধা জেলা": [
      "ফুলছড়ি উপজেলা",
      "গাইবান্ধা সদর উপজেলা",
      "গোবিন্দগঞ্জ উপজেলা",
      "পলাশবাড়ী উপজেলা",
      "সাদুল্লাপুর উপজেলা",
      "সাঘাটা উপজেলা",
      "সুন্দরগঞ্জ উপজেলা"
    ],
    "কুড়িগ্রাম জেলা": [
      "ফুলবাড়ী উপজেলা",
      "ভূরঙ্গামারী উপজেলা",
      "চর রাজিবপুর উপজেলা",
      "চিলমারী উপজেলা",
      "কুড়িগ্রাম সদর উপজেলা",
      "নাগেশ্বরী উপজেলা",
      "রাজারহাট উপজেলা",
      "রৌমারী উপজেলা",
      "উলিপুর উপজেলা"
    ],
    "লালমনিরহাট জেলা": [
      "আদিতমারী উপজেলা",
      "হাতীবান্ধা উপজেলা",
      "কালীগঞ্জ উপজেলা",
      "লালমনিরহাট সদর উপজেলা",
      "পাটগ্রাম উপজেলা"
    ],
    "নীলফামারী জেলা": [
      "ডোমার উপজেলা",
      "জলঢাকা উপজেলা",
      "কিশোরগঞ্জ উপজেলা",
      "নীলফামারী সদর উপজেলা",
      "সৈয়দপুর উপজেলা",
      "ডিমলা উপজেলা"
    ],
    "পঞ্চগড় জেলা": [
      "আটোয়ারী উপজেলা",
      "বোদা উপজেলা",
      "দেবীগঞ্জ উপজেলা",
      "পঞ্চগড় সদর",
      "তেঁতুলিয়া উপজেলা"
    ],
    "রংপুর জেলা": [
      "বদরগঞ্জ উপজেলা",
      "কাউনিয়া উপজেলা",
      "রংপুর সদর উপজেলা",
      "মিঠাপুকুর উপজেলা",
      "পীরগাছা উপজেলা",
      "পীরগঞ্জ উপজেলা",
      "তারাগঞ্জ উপজেলা",
      "গংগাচড়া উপজেলা"
    ],
    "ঠাকুরগাঁও জেলা": [
      "পীরগঞ্জ উপজেলা",
      "বালিয়াডাঙ্গী উপজেলা",
      "হরিপুর উপজেলা",
      "রাণীশংকৈল উপজেলা",
      "ঠাকুরগাঁও সদর উপজেলা"
    ]
  },
  "ময়মনসিংহ বিভাগ": {
    "জামালপুর জেলা": [
      "বকশীগঞ্জ উপজেলা",
      "দেওয়ানগঞ্জ উপজেলা",
      "ইসলামপুর উপজেলা",
      "জামালপুর সদর উপজেলা",
      "মাদারগঞ্জ উপজেলা",
      "মেলান্দহ উপজেলা",
      "সরিষাবাড়ী উপজেলা"
    ],
    "ময়মনসিংহ জেলা": [
      "ভালুকা উপজেলা",
      "ধোবাউড়া উপজেলা",
      "ফুলবাড়ীয়া উপজেলা",
      "গফরগাঁও উপজেলা",
      "গৌরীপুর উপজেলা",
      "হালুয়াঘাট উপজেলা",
      "ঈশ্বরগঞ্জ উপজেলা",
      "ময়মনসিংহ সদর উপজেলা",
      "মুক্তাগাছা উপজেলা",
      "নান্দাইল উপজেলা",
      "ফুলপুর উপজেলা",
      "তারাকান্দা উপজেলা",
      "ত্রিশাল উপজেলা"
    ],
    "নেত্রকোণা জেলা": [
      "আটপাড়া উপজেলা",
      "বারহাট্টা উপজেলা",
      "দুর্গাপুর উপজেলা",
      "খালিয়াজুরী উপজেলা",
      "কলমাকান্দা উপজেলা",
      "কেন্দুয়া উপজেলা",
      "মদন উপজেলা",
      "মোহনগঞ্জ উপজেলা",
      "নেত্রকোণা সদর উপজেলা",
      "পূর্বধলা উপজেলা"
    ],
    "শেরপুর জেলা": [
      "ঝিনাইগাতী উপজেলা",
      "নকলা উপজেলা",
      "নালিতাবাড়ী উপজেলা",
      "শেরপুর সদর উপজেলা",
      "শ্রীবরদী উপজেলা"
    ]
  },
  "বরিশাল বিভাগ": {
    "ঝালকাঠি জেলা": [
      "ঝালকাঠি সদর উপজেলা",
      "নলছিটি উপজেলা",
      "কাঠালিয়া উপজেলা",
      "রাজাপুর উপজেলা"
    ],
    "বরগুনা জেলা": [
      "আমতলী উপজেলা",
      "বামনা উপজেলা",
      "বরগুনা সদর উপজেলা",
      "বেতাগী উপজেলা",
      "পাথরঘাটা উপজেলা",
      "তালতলী উপজেলা"
    ],
    "বরিশাল জেলা": [
      "আগৈলঝাড়া উপজেলা",
      "babuganj উপজেলা",
      "বাকেরগঞ্জ উপজেলা",
      "বানারীপাড়া উপজেলা",
      "গৌরনদী উপজেলা",
      "হিজলা উপজেলা",
      "বরিশাল সদর উপজেলা",
      "মেহেন্দিগঞ্জ উপজেলা",
      "মুলাদী উপজেলা",
      "উজিরপুর উপজেলা"
    ],
    "ভোলা জেলা": [
      "ভোলা সদর উপজেলা",
      "বোরহানউদ্দিন উপজেলা",
      "দৌলতখান উপজেলা",
      "লালমোহন উপজেলা",
      "মনপুরা উপজেলা",
      "তজুমদ্দিন উপজেলা",
      "চরফ্যাশন উপজেলা"
    ],
    "পটুয়াখালী জেলা": [
      "বাউফল উপজেলা",
      "দশমিনা উপজেলা",
      "দুমকী উপজেলা",
      "কলাপাড়া উপজেলা",
      "মির্জাগঞ্জ উপজেলা",
      "পটুয়াখালী সদর উপজেলা",
      "রাঙ্গাবালী উপজেলা",
      "গলাচিপা উপজেলা"
    ],
    "পিরোজপুর জেলা": [
      "ভান্ডারিয়া উপজেলা",
      "কাউখালী উপজেলা",
      "মঠবাড়ীয়া উপজেলা",
      "নাজিরপুর উপজেলা",
      "পিরোজপুর সদর উপজেলা",
      "নেছারাবাদ উপজেলা",
      "জিয়ানগর উপজেলা"
    ]
  }
};

const enData = {
  "Dhaka Division": {
    "Dhaka District": [
      "Dhamrai Upazila",
      "Dohar Upazila",
      "Keraniganj Upazila",
      "Nawabganj Upazila",
      "Savar Upazila"
    ],
    "Faridpur District": [
      "Alfadanga Upazila",
      "Bhanga Upazila",
      "Boalmari Upazila",
      "Charbhadrasan Upazila",
      "Faridpur Sadar Upazila",
      "Madhukhali Upazila",
      "Nagarkanda Upazila",
      "Sadarpur Upazila",
      "Saltha Upazila"
    ],
    "Gazipur District": [
      "Gazipur Sadar Upazila",
      "Kaliakair Upazila",
      "Kaliganj Upazila",
      "Kapasia Upazila",
      "Sreepur Upazila"
    ],
    "Gopalganj District": [
      "Gopalganj Sadar Upazila",
      "Kashiani Upazila",
      "Kotalipara Upazila",
      "Muksudpur Upazila",
      "Tungipara Upazila"
    ],
    "Kishoreganj District": [
      "Austagram Upazila",
      "Bajitpur Upazila",
      "Bhairab Upazila",
      "Hossainpur Upazila",
      "Itna Upazila",
      "Karimgonj Upazila",
      "Katiadi Upazila",
      "Kishoreganj Sadar Upazila",
      "Kuliarchar Upazila",
      "Mithamoin Upazila",
      "Nikli Upazila",
      "Pakundia Upazila",
      "Tarail Upazila"
    ],
    "Madaripur District": [
      "Kalkini Upazila",
      "Madaripur Sadar Upazila",
      "Rajoir Upazila",
      "Shibchar Upazila",
      "Dasar Upazila"
    ],
    "Manikganj District": [
      "Daulatpur Upazila",
      "Gior Upazila",
      "Harirampur Upazila",
      "Manikganj Sadar Upazila",
      "Saturia Upazila",
      "Shibaloy Upazila",
      "Singiar Upazila"
    ],
    "Munshiganj District": [
      "Gajaria Upazila",
      "Louhajanj Upazila",
      "Munshiganj Sadar Upazila",
      "Sirajdikhan Upazila",
      "Sreenagar Upazila",
      "Tongibari Upazila"
    ],
    "Narayanganj District": [
      "Araihazar Upazila",
      "Sonargaon Upazila",
      "Narayanganj Sadar Upazila",
      "Rupganj Upazila",
      "Bandar Upazila"
    ],
    "Narsingdi District": [
      "Belabo Upazila",
      "Monohardi Upazila",
      "Narsingdi Sadar Upazila",
      "Palash Upazila",
      "Raipura Upazila",
      "Shibpur Upazila"
    ],
    "Rajbari District": [
      "Baliakandi Upazila",
      "Goalanda Upazila",
      "Kalukhali Upazila",
      "Pangsa Upazila",
      "Rajbari Sadar Upazila"
    ],
    "Shariatpur District": [
      "Bhedarganj Upazila",
      "Damudya Upazila",
      "Gosairhat Upazila",
      "Naria Upazila",
      "Shariatpur Sadar Upazila",
      "Zajira Upazila"
    ],
    "Tangail District": [
      "Basail Upazila",
      "Bhuapur Upazila",
      "Delduar Upazila",
      "Dhanbari Upazila",
      "Ghatail Upazila",
      "Gopalpur Upazila",
      "Kalihati Upazila",
      "Madhupur Upazila",
      "Mirzapur Upazila",
      "Nagarpur Upazila",
      "Sakhipur Upazila",
      "Tangail Sadar Upazila"
    ]
  },
  "Khulna Division": {
    "Bagerhat District": [
      "Chitalmari Upazila",
      "Fakirhat Upazila",
      "Kachua Upazila",
      "Mollahat Upazila",
      "Mongla Upazila",
      "Morrelganj Upazila",
      "Rampal Upazila",
      "Sarankhola Upazila",
      "Bagerhat Sadar Upazila"
    ],
    "Chuadanga District": [
      "Alamdanga Upazila",
      "Chuadanga Sadar Upazila",
      "Damurhuda Upazila",
      "Jibannagar Upazila"
    ],
    "Jashore District": [
      "Abhaynagar Upazila",
      "Bagherpara Upazila",
      "Chougachha Upazila",
      "Jhikargacha Upazila",
      "Keshabpur Upazila",
      "Jessore Sadar Upazila",
      "Manirampur Upazila",
      "Sharsha Upazila"
    ],
    "Jhenaidah District": [
      "Harinakundu Upazila",
      "Jhenaidah Sadar Upazila",
      "Kaliganj Upazila",
      "Kotchandpur Upazila",
      "Moheshpur Upazila",
      "Shailkupa Upazila"
    ],
    "Khulna District": [
      "Botiaghata Upazila",
      "Dakop Upazila",
      "Dumuria Upazila",
      "Koyra Upazila",
      "Paikgasa Upazila",
      "Fultola Upazila",
      "Rupsha Upazila",
      "Terokhada Upazila",
      "Digholia Upazila"
    ],
    "Kushtia District": [
      "Bheramara Upazila",
      "Daulatpur Upazila",
      "Khoksa Upazila",
      "Kumarkhali Upazila",
      "Kushtia Sadar Upazila",
      "Mirpur Upazila"
    ],
    "Magura District": [
      "Magura Sadar Upazila",
      "Mohammadpur Upazila",
      "Shalikha Upazila",
      "Sreepur Upazila"
    ],
    "Meherpur District": [
      "Gangni Upazila",
      "Mujibnagar Upazila",
      "Meherpur Sadar Upazila"
    ],
    "Narail District": [
      "Kalia Upazila",
      "Lohagara Upazila",
      "Narail Sadar Upazila"
    ],
    "Satkhira District": [
      "Assasuni Upazila",
      "Debhata Upazila",
      "Kalaroa Upazila",
      "Kaliganj Upazila",
      "Satkhira Sadar Upazila",
      "Shyamnagar Upazila",
      "Tala Upazila"
    ]
  },
  "Chattogram Division": {
    "Bandarban District": [
      "Alikadam Upazila",
      "Bandarban Sadar Upazila",
      "Lama Upazila",
      "Naikhongchhari Upazila",
      "Rowangchhari Upazila",
      "Ruma Upazila",
      "Thanchi Upazila"
    ],
    "Brahmanbaria District": [
      "Akhaura Upazila",
      "Bancharampur Upazila",
      "Bijoynagar Upazila",
      "Brahmanbaria Sadar Upazila",
      "Ashuganj Upazila",
      "Kasba Upazila",
      "Nabinagar Upazila",
      "Nasirnagar Upazila",
      "Sarail Upazila"
    ],
    "Chandpur District": [
      "Chandpur Sadar Upazila",
      "Faridgonj Upazila",
      "Haimchar Upazila",
      "Hajiganj Upazila",
      "Kachua Upazila",
      "Matlab South Upazila",
      "Matlab North Upazila",
      "Shahrasti Upazila"
    ],
    "Chattogram District": [
      "Anwara Upazila",
      "Banshkhali Upazila",
      "Boalkhali Upazila",
      "Chandanaish Upazila",
      "Fatikchhari Upazila",
      "Hathazari Upazila",
      "Lohagara Upazila",
      "Mirsharai Upazila",
      "Patiya Upazila",
      "Rangunia Upazila",
      "Raozan Upazila",
      "Sandwip Upazila",
      "Satkania Upazila",
      "Sitakunda Upazila",
      "Karnafuli Upazila"
    ],
    "Cumilla District": [
      "Barura Upazila",
      "Brahmanpara Upazila",
      "Burichang Upazila",
      "Chandina Upazila",
      "Chauddagram Upazila",
      "Adarsha Sadar Upazila",
      "Sadar South Upazila",
      "Daudkandi Upazila",
      "Debidwar Upazila",
      "Homna Upazila",
      "Laksam Upazila",
      "Monohargonj Upazila",
      "Meghna Upazila",
      "Muradnagar Upazila",
      "Nangalkot Upazila",
      "Titas Upazila",
      "Lalmai Upazila"
    ],
    "Coxsbazar District": [
      "Chakaria Upazila",
      "Coxsbazar Sadar Upazila",
      "Kutubdia Upazila",
      "Moheshkhali Upazila",
      "Pekua Upazila",
      "Ramu Upazila",
      "Teknaf Upazila",
      "Ukhiya Upazila",
      "Eidgaon Upazila"
    ],
    "Feni District": [
      "Chhagalnaiya Upazila",
      "Daganbhuiyan Upazila",
      "Feni Sadar Upazila",
      "Fulgazi Upazila",
      "Parshuram Upazila",
      "Sonagazi Upazila"
    ],
    "Khagrachari District": [
      "Dighinala Upazila",
      "Manikchari Upazila",
      "Khagrachhari Sadar Upazila",
      "Laxmichhari Upazila",
      "Mohalchari Upazila",
      "Matiranga Upazila",
      "Panchari Upazila",
      "Ramgarh Upazila",
      "Guimara Upazila"
    ],
    "Lakshmipur District": [
      "Kamalnagar Upazila",
      "Lakshmipur Sadar Upazila",
      "Raipur Upazila",
      "Ramganj Upazila",
      "Ramgati Upazila"
    ],
    "Noakhali District": [
      "Begumganj Upazila",
      "Chatkhil Upazila",
      "Companiganj Upazila",
      "Hatia Upazila",
      "Senbug Upazila",
      "Sonaimuri Upazila",
      "Subarnachar Upazila",
      "Noakhali Sadar Upazila",
      "Kabirhat Upazila"
    ],
    "Rangamati District": [
      "Baghaichari Upazila",
      "Barkal Upazila",
      "Kawkhali Upazila",
      "Kaptai Upazila",
      "Juraichari Upazila",
      "Langadu Upazila",
      "Naniarchar Upazila",
      "Rangamati Sadar Upazila",
      "Rajasthali Upazila",
      "Belaichari Upazila"
    ]
  },
  "Rajshahi Division": {
    "Bogura District": [
      "Adamdighi Upazila",
      "Bogura Sadar Upazila",
      "Dhunot Upazila",
      "Dupchanchia Upazila",
      "Gabtali Upazila",
      "Kahaloo Upazila",
      "Nondigram Upazila",
      "Shariakandi Upazila",
      "Shajahanpur Upazila",
      "Sherpur Upazila",
      "Shibganj Upazila",
      "Sonatala Upazila"
    ],
    "Joypurhat District": [
      "Akkelpur Upazila",
      "Joypurhat Sadar Upazila",
      "Kalai Upazila",
      "Panchbibi Upazila",
      "Khetlal Upazila"
    ],
    "Naogaon District": [
      "Atrai Upazila",
      "Dhamoirhat Upazila",
      "Manda Upazila",
      "Mohadevpur Upazila",
      "Naogaon Sadar Upazila",
      "Niamatpur Upazila",
      "Patnitala Upazila",
      "Raninagar Upazila",
      "Sapahar Upazila",
      "Badalgachi Upazila",
      "Porsha Upazila"
    ],
    "Natore District": [
      "Bagatipara Upazila",
      "Baraigram Upazila",
      "Gurudaspur Upazila",
      "Lalpur Upazila",
      "Natore Sadar Upazila",
      "Singra Upazila",
      "Naldanga Upazila"
    ],
    "Chapainawabganj District": [
      "Shibganj Upazila",
      "Bholahat Upazila",
      "Gomostapur Upazila",
      "Nachol Upazila",
      "Chapainawabganj Sadar Upazila"
    ],
    "Pabna District": [
      "Atghoria Upazila",
      "Bera Upazila",
      "Bhangura Upazila",
      "Chatmohar Upazila",
      "Faridpur Upazila",
      "Ishurdi Upazila",
      "Pabna Sadar Upazila",
      "Santhia Upazila",
      "Sujanagar Upazila"
    ],
    "Rajshahi District": [
      "Bagha Upazila",
      "Bagmara Upazila",
      "Charghat Upazila",
      "Durgapur Upazila",
      "Godagari Upazila",
      "Mohonpur Upazila",
      "Paba Upazila",
      "Puthia Upazila",
      "Tanore Upazila"
    ],
    "Sirajganj District": [
      "Belkuchi Upazila",
      "Chauhali Upazila",
      "Kamarkhand Upazila",
      "Kazipur Upazila",
      "Raigonj Upazila",
      "Shahjadpur Upazila",
      "Sirajganj Sadar Upazila",
      "Tarash Upazila",
      "Ullapara Upazila"
    ]
  },
  "Sylhet Division": {
    "Habiganj District": [
      "Ajmiriganj Upazila",
      "Bahubal Upazila",
      "Baniachong Upazila",
      "Chunarughat Upazila",
      "Habiganj Sadar Upazila",
      "Lakhai Upazila",
      "Madhabpur Upazila",
      "Nabiganj Upazila",
      "Shayestaganj Upazila",
      "Shaistaganj Upazila"
    ],
    "Moulvibazar District": [
      "Barlekha Upazila",
      "Juri Upazila",
      "Kamolganj Upazila",
      "Kulaura Upazila",
      "Moulvibazar Sadar Upazila",
      "Rajnagar Upazila",
      "Sreemangal Upazila"
    ],
    "Sunamganj District": [
      "Bishwambarpur Upazila",
      "Chhatak Upazila",
      "Derai Upazila",
      "Dharmapasha Upazila",
      "Dowarabazar Upazila",
      "Jagannathpur Upazila",
      "Jamalganj Upazila",
      "Shalla Upazila",
      "Sunamganj Sadar Upazila",
      "Tahirpur Upazila",
      "Shantiganj Upazila",
      "Madhyanagar Upazila"
    ],
    "Sylhet District": [
      "Balaganj Upazila",
      "Beanibazar Upazila",
      "Bishwanath Upazila",
      "Companiganj Upazila",
      "Dakshin Surma Upazila",
      "Fenchuganj Upazila",
      "Golapganj Upazila",
      "Gowainghat Upazila",
      "Jaintiapur Upazila",
      "Kanaighat Upazila",
      "Sylhet Sadar Upazila",
      "Zakiganj Upazila",
      "Osmani Nagar Upazila"
    ]
  },
  "Rangpur Division": {
    "Dinajpur District": [
      "Birampur Upazila",
      "Birganj Upazila",
      "Birol Upazila",
      "Bochaganj Upazila",
      "Chirirbandar Upazila",
      "Fulbari Upazila",
      "Ghoraghat Upazila",
      "Hakimpur Upazila",
      "Kaharol Upazila",
      "Khansama Upazila",
      "Nawabganj Upazila",
      "Parbatipur Upazila",
      "Dinajpur Sadar Upazila"
    ],
    "Gaibandha District": [
      "Phulchari Upazila",
      "Gaibandha Sadar Upazila",
      "Gobindaganj Upazila",
      "Palashbari Upazila",
      "Sadullapur Upazila",
      "Saghata Upazila",
      "Sundarganj Upazila"
    ],
    "Kurigram District": [
      "Phulbari Upazila",
      "Bhurungamari Upazila",
      "Charrajibpur Upazila",
      "Chilmari Upazila",
      "Kurigram Sadar Upazila",
      "Nageshwari Upazila",
      "Rajarhat Upazila",
      "Rowmari Upazila",
      "Ulipur Upazila"
    ],
    "Lalmonirhat District": [
      "Aditmari Upazila",
      "Hatibandha Upazila",
      "Kaliganj Upazila",
      "Lalmonirhat Sadar Upazila",
      "Patgram Upazila"
    ],
    "Nilphamari District": [
      "Domar Upazila",
      "Jaldhaka Upazila",
      "Kishorganj Upazila",
      "Nilphamari Sadar Upazila",
      "Syedpur Upazila",
      "Dimla Upazila"
    ],
    "Panchagarh District": [
      "Atwari Upazila",
      "Boda Upazila",
      "Debiganj Upazila",
      "Panchagarh Sadar Upazila",
      "Tetulia Upazila"
    ],
    "Rangpur District": [
      "Badargonj Upazila",
      "Kaunia Upazila",
      "Rangpur Sadar Upazila",
      "Mithapukur Upazila",
      "Pirgacha Upazila",
      "Pirgonj Upazila",
      "Taragonj Upazila",
      "Gangachara Upazila"
    ],
    "Thakurgaon District": [
      "Pirganj Upazila",
      "Baliadangi Upazila",
      "Haripur Upazila",
      "Ranisankail Upazila",
      "Thakurgaon Sadar Upazila"
    ]
  },
  "Mymensingh Division": {
    "Jamalpur District": [
      "Bokshiganj Upazila",
      "Dewangonj Upazila",
      "Islampur Upazila",
      "Jamalpur Sadar Upazila",
      "Madarganj Upazila",
      "Melandah Upazila",
      "Sarishabari Upazila"
    ],
    "Mymensingh District": [
      "Bhaluka Upazila",
      "Dhobaura Upazila",
      "Fulbaria Upazila",
      "Gafargaon Upazila",
      "Gouripur Upazila",
      "Haluaghat Upazila",
      "Iswarganj Upazila",
      "Mymensingh Sadar Upazila",
      "Muktagacha Upazila",
      "Nandail Upazila",
      "Phulpur Upazila",
      "Tarakanda Upazila",
      "Trishal Upazila"
    ],
    "Netrokona District": [
      "Atpara Upazila",
      "Barhatta Upazila",
      "Durgapur Upazila",
      "Khaliajuri Upazila",
      "Kalmakanda Upazila",
      "Kendua Upazila",
      "Madan Upazila",
      "Mohongonj Upazila",
      "Netrokona Sadar Upazila",
      "Purbadhala Upazila"
    ],
    "Sherpur District": [
      "Jhenaigati Upazila",
      "Nokla Upazila",
      "Nalitabari Upazila",
      "Sherpur Sadar Upazila",
      "Sreebordi Upazila"
    ]
  },
  "Barishal Division": {
    "Jhalakathi District": [
      "Jhalakathi Sadar Upazila",
      "Nalchity Upazila",
      "Kathalia Upazila",
      "Rajapur Upazila"
    ],
    "Barguna District": [
      "Amtali Upazila",
      "Bamna Upazila",
      "Barguna Sadar Upazila",
      "Betagi Upazila",
      "Pathorghata Upazila",
      "Taltali Upazila"
    ],
    "Barishal District": [
      "Agailjhara Upazila",
      "Babuganj Upazila",
      "Bakerganj Upazila",
      "Banaripara Upazila",
      "Gournadi Upazila",
      "Hizla Upazila",
      "Barishal Sadar Upazila",
      "Mehendiganj Upazila",
      "Muladi Upazila",
      "Wazirpur Upazila"
    ],
    "Bhola District": [
      "Bhola Sadar Upazila",
      "Borhanuddin Upazila",
      "Doulatkhan Upazila",
      "Lalmohan Upazila",
      "Monpura Upazila",
      "Tazumuddin Upazila",
      "Charfesson Upazila"
    ],
    "Patuakhali District": [
      "Bauphal Upazila",
      "Dashmina Upazila",
      "Dumki Upazila",
      "Kalapara Upazila",
      "Mirzaganj Upazila",
      "Patuakhali Sadar Upazila",
      "Rangabali Upazila",
      "Galachipa Upazila"
    ],
    "Pirojpur District": [
      "Bhandaria Upazila",
      "Kawkhali Upazila",
      "Mathbaria Upazila",
      "Nazirpur Upazila",
      "Pirojpur Sadar Upazila",
      "Nesarabad Upazila",
      "Zianagar Upazila"
    ]
  }
};

const bnDivKeys = Object.keys(bnData);
const enDivKeys = Object.keys(enData);

const merged = enDivKeys.map((enDiv, i) => {
  const bnDiv = bnDivKeys[i];
  
  const bnDistKeys = Object.keys(bnData[bnDiv]);
  const enDistKeys = Object.keys(enData[enDiv]);
  
  const districts = enDistKeys.map((enDist, j) => {
    const bnDist = bnDistKeys[j];
    
    const enUpas = enData[enDiv][enDist];
    const bnUpas = bnData[bnDiv][bnDist];
    
    const upazilas = enUpas.map((enUpa, k) => {
      const bnUpa = bnUpas[k];
      return { en: enUpa, bn: bnUpa };
    });
    
    return { en: enDist, bn: bnDist, upazilas };
  });
  
  return { en: enDiv, bn: bnDiv, districts };
});

const fileContent = "export const DIVISION_DATA = " + JSON.stringify(merged, null, 2) + ";\n";
fs.writeFileSync('artifacts/api-server/src/lib/administrative-data.js', fileContent);
console.log("Written merged data to administrative-data.js");
