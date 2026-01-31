"use client";

import React from "react";
import { PolicyPage } from "@/components/legal/PolicyPage";
import { Shield } from "lucide-react";

const contentEn = `Privacy Policy for F. A. Creative Firm Limited
At facreative.biz, accessible from https://facreative.biz/, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by facreative.biz and how we use it.

If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.

This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in facreative.biz. This policy is not applicable to any information collected offline or via channels other than this website.

Consent
By using our website, you hereby consent to our Privacy Policy and agree to its terms.

Information we collect
The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.

How we use your information
We use the information we collect in various ways, including to:
Provide, operate, and maintain our website
Improve, personalize, and expand our website
Understand and analyze how you use our website
Develop new products, services, features, and functionality
Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes
Send you emails
Find and prevent fraud

Log Files
facreative.biz follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services’ analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users’ movement on the website, and gathering demographic information.

Cookies and Web Beacons
Like any other website, facreative.biz uses ‘cookies’. These cookies are used to store information including visitors’ preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users’ experience by customizing our web page content based on visitors’ browser type and/or other information.

Google DoubleClick DART Cookie
Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – https://policies.google.com/technologies/ads

Advertising Partners Privacy Policies
You may consult this list to find the Privacy Policy for each of the advertising partners of facreative.biz.
Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on facreative.biz, which are sent directly to users’ browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
Note that facreative.biz has no access to or control over these cookies that are used by third-party advertisers.

Third Party Privacy Policies
facreative.biz’s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers’ respective websites.

CCPA Privacy Rights (Do Not Sell My Personal Information)
Under the CCPA, among other rights, California consumers have the right to:
Request that a business that collects a consumer’s personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.
Request that a business delete any personal data about the consumer that a business has collected.
Request that a business that sells a consumer’s personal data, not sell the consumer’s personal data.
If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.

GDRP Data Protection Rights
We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
The right to access – You have the right to request copies of your personal data. We may charge you a small fee for this service.
The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.
The right to erasure – You have the right to request that we erase your personal data, under certain conditions.
The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.
The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.
The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.
If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.

Children’s Information
Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
facreative.biz does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.`;

const contentBn = `এফ. এ. ক্রিয়েটিভ ফার্ম লিমিটেড - এর গোপনীয়তার নীতি
FACreative.biz এর গোপনীয়তার নীতি পেজে আপনাকে স্বাগতম। আমাদের ওয়েবসাইটের সার্ভিস গ্রহণ করার আগে আমাদের সকল গোপনীয়তার নীতি মনোযোগ সহকারে পড়ে নেওয়ার জন্য অনুরোধ রইলো।
আমাদের ওয়েবসাইটের গোপনীয়তার নীতি আমাদের ওয়েবসাইটের সকল ভিজিটর দের জন্যই প্রযোজ্য। আমরা আপনারা সেনসিটিভ কোনো তথ্য শেয়ার কিংবা কালেক্ট করি না!

সম্মতিঃ
আপনি আমাদের ওয়েবসাইটের পরিসেবা গ্রহণ করেছেন মানে এই যে আপনি আমাদের শর্তাবলি মেনে মেনে নিয়েছেন!

আমরা যেসব তথ্য সংগ্রহ করিঃ
আপনাকে যে ব্যক্তিগত তথ্য প্রদান করতে বলা হবে, এবং কেন আপনাকে এটি প্রদান করতে হবে তাও বলা হবে, আমরা যখন আপনাকে আপনার ব্যক্তিগত তথ্য সংগ্রহ করবো তখনই আপনাকে স্পষ্ট করে জানিয়ে দেওয়া হবে।
আপনি যদি সরাসরি আমাদের সাথে যোগাযোগ করেন, তাহলে আমরা আপনার সম্পর্কে অতিরিক্ত যেসব তথ্য পেতে পারি সেগুলো হলোঃ আপনার নাম, ই-মেইল ঠিকানা, ফোন নম্বর এবং আপনি যদি মেইলের সাথে কোনো ফাইল পাঠান সেগুলো।
আপনি যখন একটি অ্যাকাউন্টের জন্য নিবন্ধন করেন, তখন আমরা নাম, কোম্পানির নাম, ঠিকানা, ইমেল ঠিকানা এবং টেলিফোন নম্বর সহ আপনার যোগাযোগের তথ্য চাইতে পারি।

আমরা আপনার সম্পর্কে তথ্যগুলো যেকারণে সংগ্রহ করে থাকিঃ
আমরা আপনার তথ্যগুলো বিভিন্ন কারণে সংগ্রহ করে থাকি। যেমনঃ
আমাদের ওয়েবসাইট পরিচালনার জন্য!
আমাদের ওয়েবসাইটে ইউজার এক্সপেরিয়েন্স ইম্প্রুভ করার জন্য!
আপনার থেকে পাওয়া তথ্য অনুযায়ী নতুন নতুন পরিসেবা, প্রোডাক্ট, ফিচার আনার জন্য!
আপনার সাথে যোগাযোগের জন্য, গ্রাহক পরিষেবা, আপনাকে ওয়েবসাইট সম্পর্কিত আপডেট এবং অন্যান্য তথ্য সরবরাহ করতে এবং আমাদের বিভিন্ন প্রোডাক্ট বা ফিচার মার্কেটিং করার জন্য!
আপনাকে ই-মেইল পাঠানোর জন্য!
আমাদের ওয়েবসাইট স্প্যামিং মুক্ত রাখার জন্য!

লগ ফাইলসঃ
facreative.biz লগ ফাইল ব্যবহার করার একটি আদর্শ পদ্ধতি অনুসরণ করে। এই লগ তখনই ফাইল করা হয় যখন কোনো ভিজিটর ওয়েবসাইট পরিদর্শন করে। সমস্ত হোস্টিং কোম্পানি এটি করে এবং হোস্টিং পরিষেবার বিশ্লেষণের একটি অন্যতম অংশ। লগ ফাইলের মাধ্যমে সংগৃহীত তথ্যের মধ্যে রয়েছে ইন্টারনেট প্রোটোকল (IP) ঠিকানা, ব্রাউজারের ধরন, ইন্টারনেট পরিষেবা প্রদানকারী (ISP), তারিখ এবং সময় স্ট্যাম্প, ল্যান্ডিং/এক্সিট পেজ এবং ক্লিকের সংখ্যা। এগুলি ব্যক্তিগতভাবে শনাক্তযোগ্য এমন কোনও তথ্যের মধ্যে পড়ে না। এসব তথ্য সংগ্রহ করার উদ্দেশ্য হলো বর্তমান ট্রেন্ডিং বিশ্লেষণ করা, সাইট পরিচালনা করা, ওয়েবসাইটে ব্যবহারকারীদের গতিবিধি ট্র্যাক করা এবং সাইটের মোট ভিজিটর সংক্রান্ত তথ্য সংগ্রহ করা

গুগল ডাবল ক্লিক DART কুকিজঃ
Google আমাদের ওয়েবসাইটের একটি অ্যাডভারটাইজিং পার্টনার। এটি আমাদের সাইটের ভিজিটরদের আমাদের ওয়েবসাইট এবং ইন্টারনেটে অন্যান্য ওয়েবসাইটগুলোতে ভিজিট করার উপর ভিত্তি করে বিজ্ঞাপন পরিবেশন করতে কুকিজ, যা DART কুকি নামে পরিচিত। তবে যেকোনো গুগল ইউজার নিম্নলিখিত URL এ Google বিজ্ঞাপন এবং সামগ্রী নেটওয়ার্ক গোপনীয়তা নীতিতে গিয়ে DART কুকিজ ব্যবহার প্রত্যাখ্যান করতে পারে – https://policies.google.com/technologies/ads

আমাদের অ্যাডভারটাইজিং পার্টনারঃ
আমাদের সাইটে কিছু বিজ্ঞাপনদাতা আপনার বাউজারের কুকি ব্যবহার করতে পারে। আমাদের বিজ্ঞাপনদাতাদের নীচে তালিকাভুক্ত করা হয়েছে। আমাদের বিজ্ঞাপনদাতারা প্রত্যেকের ব্যবহারকারীর ডেটা সম্পর্কিত তাদের নীতিমালার জন্য তাদের নিজস্ব গোপনীয়তা নীতি রয়েছে৷ সহজে সেই গোপনীয়তার নীতি অ্যাক্সেসের জন্য, আমরা নীচে তাদের গোপনীয়তা নীতি পেজের লিংক সংযুক্ত করে দিয়েছি।
Google
https://policies.google.com/technologies/ads

CCPA গোপনীয়তার অধিকার (Do Not Sell My Personal Information)
CCPA-এর অধীনে, অন্যান্য অধিকারের মধ্যে, ক্যালিফোর্নিয়ার গ্রাহকদের নিম্নলিখিত অধিকারগুলো রয়েছে:
অনুরোধ করুন যে, একটি ব্যবসা যেটি একটি ভোক্তার ব্যক্তিগত ডেটা সংগ্রহ করে সে বিভাগগুলি এবং ব্যক্তিগত ডেতার নির্দিষ্ট অংশগুলি প্রকাশ করে যা একটি ব্যবসা গ্রাহকদের সম্পর্কে সংগ্রহ করেছে৷
অনুরোধ করুন যে, একটি ব্যবসা যে ভোক্তাদের সম্পর্কে কোনো ব্যক্তিগত তথ্য মুছে ফেলবে যা একটি ব্যবসা সংগ্রহ করেছে।
অনুরোধ করুন যে, একটি ব্যবসা যেটি একটি ভোক্তার ব্যক্তিগত ডেটা বিক্রি করে, ভোক্তার ব্যক্তিগত ডেটা বিক্রি না করে৷
আপনি যদি একটি অনুরোধ করেন, আমাদের কাছে আপনাকে উত্তর দেওয়ার জন্য এক মাস সময় আছে। আপনি যদি এই অধিকারগুলির কোনটি ব্যবহার করতে চান, তাহলে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন৷

GDRP তথ্য সংরক্ষণ অধিকারঃ
আমরা নিশ্চিত করতে চাই যে আপনি আপনার সমস্ত ডেটা সুরক্ষা অধিকার সম্পর্কে পুরোপুরি সচেতন। প্রত্যেক ব্যবহারকারীর নিম্নলিখিতগুলি পাওয়ার অধিকার রয়েছে:
অ্যাক্সেস করার অধিকার – আপনার ব্যক্তিগত ডেটার অনুলিপি অনুরোধ করার অধিকার রয়েছে৷ আমরা এই পরিষেবার জন্য আপনাকে একটি ছোট ফি নিতে পারি৷
সংশোধনের অধিকার – আপনার অনুরোধ করার অধিকার আছে যে কোনো তথ্যকে আপনি ভুল বলে মনে করেন তা সংশোধন করুন।
আপনার অনুরোধ করার অধিকার রয়েছে যে, আপনার যে তথ্যটি অসম্পূর্ণ বলে মনে করেন তা সম্পূর্ণ করার জন্য।
মুছে ফেলার অধিকার – আপনার অনুরোধ করার অধিকার আছে যে আমরা কিছু শর্তের অধীনে আপনার ব্যক্তিগত ডেটা মুছে ফেলি৷
প্রসেসিং সীমাবদ্ধ করার অধিকার – আপনার অনুরোধ করার অধিকার আছে যে আমরা কিছু শর্তের অধীনে আপনার ব্যক্তিগত ডেটা প্রক্রিয়াকরণ সীমাবদ্ধ রাখি
আপনার তথ্য প্রক্রিয়াজাতকরণে আপত্তি করার অধিকার – কিছু শর্তের অধীনে আপনার ব্যক্তিগত ডেটার আমাদের প্রক্রিয়াকরণে আপত্তি করার অধিকার আপনার আছে।
ডেটা পোর্টেবিলিটির অধিকার – আপনার কাছে অনুরোধ করার অধিকার আছে যে আমরা কিছু শর্তে আমরা যে ডেটা সংগ্রহ করেছি তা অন্য সংস্থায় বা সরাসরি আপনার কাছে হস্তান্তর করি৷
আপনি যদি একটি অনুরোধ করেন, আমাদের কাছে আপনাকে উত্তর দেওয়ার জন্য এক এক মাস সময় আছে। আপনি যদি এই অধিকারগুলির কোনটি ব্যবহার করতে চান, তাহলে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন৷

শিশুদের তথ্যঃ
আমাদের অগ্রাধিকারের আরেকটি অংশ হল ইন্টারনেট ব্যবহার করার সময় শিশুদের জন্য সুরক্ষা যোগ করা। আমরা পিতামাতা এবং অভিভাবকদের তাদের অনলাইন কার্যকলাপ পর্যবেক্ষণ, অংশগ্রহণ, এবং/অথবা নিরীক্ষণ এবং গাইড করার জন্য উৎসাহিত করি।
facreative.biz 13 বছরের কম বয়সী শিশুদের কাছ থেকে জেনেশুনে কোনো ব্যক্তিগত শনাক্তকরণযোগ্য তথ্য সংগ্রহ করে না। আপনি যদি মনে করেন যে আপনার সন্তান আমাদের ওয়েবসাইটে এই ধরনের তথ্য প্রদান করেছে, তাহলে আমরা অবিলম্বে আমাদের সাথে যোগাযোগ করার জন্য দৃঢ়ভাবে উৎসাহিত করি। এবং আমরা আমাদের রেকর্ড থেকে অবিলম্বে এই ধরনের তথ্য মুছে ফেলার জন্য আমাদের যথাসাধ্য চেষ্টা করব৷`;

export default function PrivacyPage() {
    return (
        <PolicyPage
            title="Privacy Policy"
            description="Your privacy is important to us. Learn how we collect, use, and protect your personal information."
            icon={Shield}
            contentEn={contentEn}
            contentBn={contentBn}
        />
    );
}
