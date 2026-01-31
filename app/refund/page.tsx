"use client";

import React from "react";
import { PolicyPage } from "@/components/legal/PolicyPage";
import { RefreshCcw } from "lucide-react";

const contentEn = `Overview
Our refund and returns policy lasts 30 days. If 30 days have passed since your purchase, we can’t offer you a full refund or exchange.
To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
Several types of goods are exempt from being returned. Perishable goods such as food, flowers, newspapers or magazines cannot be returned. We also do not accept products that are intimate or sanitary goods, hazardous materials, or flammable liquids or gases.

Additional non-returnable items:
Gift cards
Downloadable software products
Some health and personal care items
To complete your return, we require a receipt or proof of purchase.
Please do not send your purchase back to the manufacturer.

There are certain situations where only partial refunds are granted:
Book with obvious signs of use
CD, DVD, VHS tape, software, video game, cassette tape, or vinyl record that has been opened.
Any item not in its original condition, is damaged or missing parts for reasons not due to our error.
Any item that is returned more than 30 days after delivery

Refunds
Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.

Late or missing refunds
If you haven’t received a refund yet, first check your bank account again.
Then contact your credit card company, it may take some time before your refund is officially posted.
Next contact your bank. There is often some processing time before a refund is posted.
If you’ve done all of this and you still have not received your refund yet, please contact us.

Sale items
Only regular priced items may be refunded. Sale items cannot be refunded.

Exchanges
We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email.

Gifts
If the item was marked as a gift when purchased and shipped directly to you, you’ll receive a gift credit for the value of your return. Once the returned item is received, a gift certificate will be mailed to you.
If the item wasn’t marked as a gift when purchased, or the gift giver had the order shipped to themselves to give to you later, we will send a refund to the gift giver and they will find out about your return.

Shipping returns
To return your product, you should mail your product to our physical address.
You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
Depending on where you live, the time it may take for your exchanged product to reach you may vary.
If you are returning more expensive items, you may consider using a trackable shipping service or purchasing shipping insurance. We don’t guarantee that we will receive your returned item.

Need help?
Contact us at our primary support email for questions related to refunds and returns.`;

const contentBn = `ওভারভিউ
আমাদের ফেরত এবং রিটার্ন নীতি 30 দিন স্থায়ী হয়। যদি আপনার কেনাকাড়ার 30 দিন অতিবাহিত হয়, আমরা আপনাকে সম্পূর্ণ অর্থ ফেরত বা বিনিময় অফার করতে পারি না।
ফেরত পাওয়ার জন্য যোগ্য হতে, আপনার আইটেমটি অবশ্যই অব্যবহৃত এবং আপনি যে অবস্থায় পেয়েছেন সেই অবস্থায় থাকতে হবে। এটি অবশ্যই মূল প্যাকেজিংয়ে থাকতে হবে।
বিভিন্ন ধরণের পণ্য ফেরত থেকে অব্যাহতি দেওয়া হয়েছে। পচনশীল পণ্য যেমন খাদ্য, ফুল, সংবাদপত্র বা ম্যাগাজিন ফেরত দেওয়া যাবে না। আমরা এমন পণ্যগুলিও গ্রহণ করি না যা অন্তরঙ্গ বা স্যানিটারি পণ্য, বিপজ্জনক পদার্থ, বা দাহ্য তরল বা গ্যাস।

অতিরিক্ত অ-ফেরতযোগ্য আইটেম:
উপহার কার্ড
ডাউনলোডযোগ্য সফটওয়্যার পণ্য
কিছু স্বাস্থ্য এবং ব্যক্তিগত যত্ন আইটেম
আপনার রিটার্ন সম্পূর্ণ করতে, আমাদের একটি রসিদ বা ক্রয়ের প্রমাণ প্রয়োজন।
অনুগ্রহ করে আপনার ক্রয়টি প্রস্তুতকারকের কাছে ফেরত পাঠাবেন না।

কিছু নির্দিষ্ট পরিস্থিতিতে আছে যেখানে শুধুমাত্র আংশিক ফেরত দেওয়া হয়:
ব্যবহারের সুস্পষ্ট লক্ষণ সহ বুক করুন
সিডি, ডিভিডি, ভিএইচএস টেপ, সফ্টওয়্যার, ভিডিও গেম, ক্যাসেট টেপ, বা ভিনাইল রেকর্ড যা খোলা হয়েছে।
কোনো আইটেম তার আসল অবস্থায় নেই, আমাদের ত্রুটির কারণে না হওয়ার কারণে ক্ষতিগ্রস্ত বা অনুপস্থিত অংশ।
যে কোনো আইটেম যা প্রসবের 30 দিনের বেশি পরে ফেরত দেওয়া হয়

ফেরত
একবার আপনার রিটার্ন প্রাপ্ত এবং পরিদর্শন করা হলে, আমরা আপনাকে একটি ইমেল পাঠাব যাতে আপনাকে জানানো হয় যে আমরা আপনার ফেরত আইটেমটি পেয়েছি। আমরা আপনাকে আপনার অর্থ ফেরতের অনুমোদন বা প্রত্যাখ্যান সম্পর্কেও অবহিত করব।
আপনি অনুমোদিত হলে, আপনার ফেরত প্রক্রিয়া করা হবে, এবং একটি ক্রেডিট স্বয়ংক্রিয়ভাবে আপনার ক্রেডিট কার্ড বা অর্থপ্রদানের মূল পদ্ধতিতে একটি নির্দিষ্ট দিনের মধ্যে প্রয়োগ করা হবে।

 দেরী বা অনুপস্থিত ফেরত
আপনি যদি এখনও টাকা ফেরত না পেয়ে থাকেন, তাহলে প্রথমে আপনার ব্যাঙ্ক অ্যাকাউন্ট আবার চেক করুন।
তারপর আপনার ক্রেডিট কার্ড কোম্পানির সাথে যোগাযোগ করুন, আপনার রিফান্ড আনুষ্ঠানিকভাবে পোস্ট করার আগে কিছু সময় লাগতে পারে।
এরপর আপনার ব্যাঙ্কের সাথে যোগাযোগ করুন। একটি ফেরত পোস্ট করার আগে প্রায়ই কিছু প্রক্রিয়াকরণ সময় আছে.
আপনি যদি এই সমস্ত কিছু করে থাকেন এবং আপনি এখনও আপনার অর্থ ফেরত না পান তবে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন৷

বিক্রয় আইটেম
শুধুমাত্র নিয়মিত মূল্য আইটেম ফেরত দেওয়া যেতে পারে. বিক্রয় আইটেম ফেরত করা যাবে না.

বিনিময়
আমরা শুধুমাত্র আইটেম প্রতিস্থাপন যদি তারা ত্রুটিপূর্ণ বা ক্ষতিগ্রস্ত হয়. আপনি যদি একই আইটেমটির জন্য এটি বিনিময় করতে চান, তাহলে আমাদেরকে একটি ইমেল পাঠান।

উপহার
যদি আইটেমটি একটি উপহার হিসাবে চিহ্নিত করা হয় যখন কেনা হয় এবং সরাসরি আপনাকে পাঠানো হয়, আপনি আপনার ফেরতের মূল্যের জন্য একটি উপহার ক্রেডিট পাবেন। ফিরে আসা আইটেমটি পাওয়া গেলে, একটি উপহারের শংসাপত্র আপনাকে মেল করা হবে।
যদি কেনার সময় আইটেমটি উপহার হিসাবে চিহ্নিত না করা হয়, বা উপহারদাতা আপনাকে পরে দেওয়ার জন্য নিজের কাছে অর্ডার পাঠিয়েছেন, আমরা উপহারদাতাকে ফেরত পাঠাব এবং তারা আপনার ফেরত সম্পর্কে জানতে পারবে।

পণ্য পৌছানো সংক্রান্ত তথ্য
আপনার পণ্য ফেরত দিতে, আপনাকে আপনার পণ্যটি আমাদের ঠিকানায় পাঠাতে হবে।
আপনার আইটেম ফেরত দেওয়ার জন্য আপনার নিজের শিপিং খরচের জন্য আপনি দায়ী থাকবেন। শিপিং খরচ অ ফেরতযোগ্য. আপনি যদি ফেরত পান, তাহলে রিটার্ন শিপিংয়ের খরচ আপনার ফেরত থেকে কেটে নেওয়া হবে।
আপনি কোথায় থাকেন তার উপর নির্ভর করে, আপনার বিনিময় করা পণ্যটি আপনার কাছে পৌঁছাতে যে সময় লাগতে পারে তা পরিবর্তিত হতে পারে।
যদি আপনি আরও ব্যয়বহুল আইটেম ফেরত দেন, আপনি একটি ট্র্যাকযোগ্য শিপিং পরিষেবা ব্যবহার বা শিপিং বীমা কেনার কথা বিবেচনা করতে পারেন। আমরা গ্যারান্টি দিই না যে আমরা আপনার ফেরত আইটেম পাব।

সাহায্য দরকার?
রিফান্ড এবং ফেরত সংক্রান্ত প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন।`;

export default function RefundPage() {
    return (
        <PolicyPage
            title="Refund Policy"
            description="Our policy regarding returns and refunds for our services."
            icon={RefreshCcw}
            contentEn={contentEn}
            contentBn={contentBn}
        />
    );
}
