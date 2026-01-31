"use client";

import React from "react";
import { PolicyPage } from "@/components/legal/PolicyPage";
import { Book } from "lucide-react";

const contentEn = `Overview:
F.A. Creative Firm Ltd. provides website development, mobile apps, custom software development, domain & hosting, and other digital services. Our services are governed by the following Terms & Conditions.

1. Acceptable Use of Services
All services must be used for lawful and ethical purposes. Any activity that violates the laws of Bangladesh or any other applicable country is strictly prohibited, including:
Using copyrighted content or software without permission.
Storing or distributing obscene, illegal, fraudulent, or misleading content.
Collecting or storing personal or sensitive data without consent.
Engaging in cyber-attacks or supporting criminal activities.
If any user violates the law using our services, F.A. Creative Firm Ltd. will not be liable and reserves the right to suspend or terminate services temporarily or permanently.

2. Payment & Ownership
For Website, App, and Software Development:
75% of the total project cost must be paid in advance.
The remaining 25% must be paid before project delivery.
Without full payment, ownership will not be transferred, and any claims from the client will be completely disregarded.

For Domain & Hosting Services:
Domains & hosting are annual renewable services. If not renewed on time, the service will be terminated, and the company will not be responsible for any loss.
Once registered, domains cannot be changed or refunded.
If allocated space or bandwidth is exceeded, additional charges will apply.

3. Project Delivery & Deadlines
Projects must be collected within the specified delivery date. Otherwise, we will not be responsible for any loss.
If you need to extend the delivery time, you must submit a written request via email or WhatsApp with a valid reason.
All communication requests will be preserved in printed format for reference.
Any major modifications or feature additions after delivery will incur additional charges.

4. Free Service & Maintenance
Free Support: Depending on the package, technical support is available for 1-3 months after project delivery.
Service Charges After Free Support:
First Year (after the free session): A charge of 1000 BDT per service will apply for common errors (not applicable for annual contracts).
After First Renewal: A charge of 500 BDT per service will apply for common errors (not applicable for annual contracts).
Major issues (caused by the client) will require an additional charge.
Standard issue resolution takes 24-72 hours, whereas major problems may take 5-7 business days or longer.

5. Hosting & Bandwidth Policy
Initial Hosting Space & Bandwidth Allocation:
Small Websites: 1GB storage + 10GB bandwidth.
Large Websites (News Portals, E-commerce, Online TV, E-paper, etc.): 3GB/5GB storage + 30GB/50GB bandwidth.
Exceeding Limits:
If the allocated bandwidth is exceeded, additional charges will apply.
Hosting space & bandwidth do not depend on whether the website is new or old; it depends on usage and visitor traffic.
Optimized usage can help conserve bandwidth and space.

6. Issue Resolution & Support Timeline
General issues will be resolved within 24-72 hours.
Major issues may take 5-7 business days or longer.
Emergency services may require additional charges.
New feature additions or major changes will require additional pricing.

7. Additional Terms
F.A. Creative Firm Ltd. reserves the right to modify, update, or amend these Terms & Conditions at any time.
In case of any disputes, the signed agreement between the client and the company will be considered final.
By using our services, clients agree to comply with these Terms & Conditions.`;

const contentBn = `সংক্ষিপ্ত বিবরণ:
এফ. এ. ক্রিয়েটিভ ফার্ম লিমিটেড ওয়েবসাইট ডেভেলপমেন্ট, মোবাইল অ্যাপ, কাস্টম সফটওয়্যার ডেভেলপমেন্ট, ডোমেইন ও হোস্টিং সহ বিভিন্ন ডিজিটাল পরিষেবা প্রদান করে। আমাদের পরিষেবাগুলি নিম্নলিখিত শর্তাবলীর দ্বারা পরিচালিত হবে।

১. পরিষেবার গ্রহণযোগ্য ব্যবহার
সমস্ত পরিষেবা আইনসম্মত ও নৈতিক উদ্দেশ্যে ব্যবহার করতে হবে। বাংলাদেশ তথা অন্যান্য প্রযোজ্য দেশের প্রচলিত আইনের পরিপন্থী যেকোনো কার্যক্রম কঠোরভাবে নিষিদ্ধ, যার মধ্যে অন্তর্ভুক্ত:
অনুমতি ছাড়া কপিরাইটকৃত বিষয়বস্তু বা সফটওয়্যার ব্যবহার।
অশ্লীল, অবৈধ, প্রতারণামূলক বা বিভ্রান্তিমূলক বিষয়বস্তু সংরক্ষণ বা বিতরণ।
ব্যক্তিগত বা সংবেদনশীল তথ্য সংগ্রহ বা সংরক্ষণ করা।
সাইবার আক্রমণ চালানো বা অপরাধমূলক কার্যক্রমে সহায়তা করা।
যদি কোনো ব্যবহারকারী আমাদের পরিষেবা ব্যবহার করে আইন লঙ্ঘন করেন, তাহলে এফ. এ. ক্রিয়েটিভ ফার্ম লিমিটেড দায়বদ্ধ থাকবে না এবং পরিষেবা সাময়িক বা স্থায়ীভাবে বন্ধ করার অধিকার সংরক্ষণ করে।

২. পেমেন্ট ও মালিকানা
ওয়েবসাইট, অ্যাপ এবং সফটওয়্যার ডেভেলপমেন্ট:
প্রকল্প শুরুর জন্য মোট অর্থের ৭৫% অগ্রিম পরিশোধ করতে হবে।
প্রকল্প ডেলিভারির আগে বাকি ২৫% পরিশোধ করতে হবে।
সম্পূর্ণ অর্থ পরিশোধ না হলে মালিকানা হস্তান্তর করা হবে না এবং গ্রাহকের দাবি সম্পূর্ণ অগ্রাহ্য হবে।

ডোমেইন ও হোস্টিং পরিষেবা:
ডোমেইন ও হোস্টিং বাৎসরিক নবায়নযোগ্য পরিষেবা। নির্ধারিত সময়ে নবায়ন না করলে সেবা বাতিল হয়ে যাবে এবং কোম্পানি কোনো ক্ষতির জন্য দায়ী থাকবে না।
একবার নিবন্ধিত হওয়ার পর ডোমেইন পরিবর্তন বা ফেরতযোগ্য নয়।
বরাদ্দ করা স্পেস বা ব্যান্ডউইথ অতিক্রম করলে অতিরিক্ত চার্জ প্রযোজ্য হবে।

৩. প্রকল্প ডেলিভারি ও সময়সীমা
প্রকল্প নির্ধারিত সময়ের মধ্যে গ্রহণ করতে হবে। অন্যথায়, কোনো ক্ষতির জন্য আমরা দায়ী থাকব না।
ডেলিভারির সময় বাড়ানোর প্রয়োজন হলে, যথাযথ কারণ উল্লেখ করে লিখিতভাবে, ইমেইল বা হোয়াটসঅ্যাপে আবেদন করতে হবে।
আপনার যেকোনো যোগাযোগের অনুরোধ আমরা প্রিন্ট সংরক্ষণ করব।
ডেলিভারির পর বড় পরিবর্তন বা নতুন ফিচার যোগ করলে নতুন মূল্য নির্ধারিত হবে।

৪. ফ্রি সার্ভিস ও মেইনটেন্যান্স
ফ্রি সাপোর্ট: প্যাকেজের উপর নির্ভর করে, প্রকল্প ডেলিভারির পর ১–৩ মাস পর্যন্ত প্রযুক্তিগত সহায়তা প্রদান করা হবে।
ফ্রি সাপোর্ট পরবর্তী সার্ভিস চার্জ:
প্রথম বছর (ফ্রি সেশনের পর): সাধারণ সমস্যার সমাধানে প্রতি পরিষেবার জন্য ১০০০ টাকা চার্জ প্রযোজ্য হবে (বাৎসরিক চুক্তির ক্ষেত্রে প্রযোজ্য নয়)।
প্রথম নবায়নের পর: সাধারণ সমস্যার সমাধানে প্রতি পরিষেবার জন্য ৫০০ টাকা চার্জ প্রযোজ্য হবে (বাৎসরিক চুক্তির ক্ষেত্রে প্রযোজ্য নয়)।
বড় সমস্যার (যা গ্রাহকের কারণে হয়েছে) জন্য অতিরিক্ত চার্জ প্রযোজ্য হবে।
সাধারণ সমস্যার সমাধানে ২৪–৭২ ঘণ্টা সময় লাগতে পারে, এবং বড় সমস্যার জন্য ৫–৭ কর্মদিবস বা তারও বেশি সময় লাগতে পারে।

৫. হোস্টিং ও ব্যান্ডউইথ নীতি
প্রাথমিক হোস্টিং স্পেস ও ব্যান্ডউইথ বরাদ্দ:
ছোট ওয়েবসাইট: ১GB স্টোরেজ + ১০GB ব্যান্ডউইথ।
বড় ওয়েবসাইট (সংবাদপোর্টাল, ই–কমার্স, অনলাইন টিভি, ই–পেপার, ইত্যাদি): ৩GB/৫GB স্টোরেজ + ৩০GB/৫০GB ব্যান্ডউইথ।
সীমা অতিক্রমের ক্ষেত্রে:
বরাদ্দ করা ব্যান্ডউইথ সীমা অতিক্রম করলে অতিরিক্ত চার্জ প্রযোজ্য হবে।
হোস্টিং স্পেস ও ব্যান্ডউইথ ওয়েবসাইটের নতুন বা পুরোনো অবস্থার উপর নির্ভর করে না, এটি ব্যবহার ও ভিজিটরের পরিমাণের উপর নির্ভরশীল।
সঠিক ব্যবহারের মাধ্যমে ব্যান্ডউইথ ও স্পেস অপটিমাইজ করা সম্ভব।

৬. ত্রুটি সমাধান ও সহায়তার সময়সীমা
সাধারণ সমস্যার সমাধানে ২৪–৭২ ঘণ্টা সময় লাগতে পারে।
মেজর সমস্যার জন্য ৫–৭ কর্মদিবস বা তারও বেশি সময় লাগতে পারে।
জরুরি সার্ভিস অতিরিক্ত চার্জের আওতাভুক্ত হতে পারে।
বড় পরিবর্তন বা নতুন ফিচার সংযোজনের জন্য নতুন মূল্য নির্ধারিত হবে।

৭. অন্যান্য শর্তাবলী
এফ. এ. ক্রিয়েটিভ ফার্ম লিমিটেড শর্তাবলী পরিবর্তন, আপডেট বা সংশোধন করার অধিকার সংরক্ষণ করে।
কোনো বিতর্কের ক্ষেত্রে, গ্রাহক ও কোম্পানির মধ্যে স্বাক্ষরিত চুক্তিই চূড়ান্ত বলে বিবেচিত হবে।
আমাদের পরিষেবা ব্যবহার করে গ্রাহকগণ এই শর্তাবলী মেনে চলতে সম্মত হচ্ছেন।`;

export default function TermsPage() {
    return (
        <PolicyPage
            title="Terms & Conditions"
            description="Our service governs your use of this website. Please read them carefully."
            icon={Book}
            contentEn={contentEn}
            contentBn={contentBn}
        />
    );
}
