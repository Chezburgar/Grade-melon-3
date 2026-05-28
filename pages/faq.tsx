import React from "react";
import { useRouter } from "next/router";
import { asset } from "../utils/path";

export default function FAQ() {
	const router = useRouter();
	const view = router.query.refer as string;

	return (
		<div className="p-5 md:p-10 flex-1">
			<h1 className="font-bold text-center text-3xl dark:text-white pb-5">
				FAQ & Info
			</h1>
			<div className="space-y-4">
				<details
					className="group [&_summary::-webkit-details-marker]:hidden"
					open={view === "app"}
				>
					<summary className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white">
						<h2 className="font-medium">Is Chezburger Grades an App?</h2>

						<svg
							className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</summary>

					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						Yes, Chezburger Grades is a PWA (Progessive Web App). <br />
						To Add Chezburger Grades to your Home Screen, follow these steps:
					</p>
					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						<span className="flex gap-2 items-center">
							Apple iPhone/iPad
							<img className="h-4 inline-block" src={asset("/assets/apple.png")} />
						</span>
					</p>
					<ul className="list-disc pl-10 dark:text-white">
						<li>Open Chezburger Grades in Safari</li>
						<li>Click on the Share button in the bottom bar</li>
						<li>Click on &quot;Add to Home Screen&quot;</li>
					</ul>
					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						<span className="flex gap-2 items-center">
							Android
							<img className="h-4 inline-block" src={asset("/assets/android.png")} />
						</span>
					</p>
					<ul className="list-disc ml-10 dark:text-white">
						<li>Open Chezburger Grades in Chrome</li>
						<li>Click on the 3 dots in the top right corner</li>
						<li>Click on &quot;Add to Home Screen&quot;</li>
					</ul>

					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						<span className="flex gap-2 items-center">
							Personal Computer
							<img className="h-4 inline-block" src={asset("/assets/pc.png")} />
						</span>
					</p>
					<ul className="list-disc ml-10 dark:text-white">
						<li>Open Chezburger Grades in Chrome</li>
						<li>Click on the 3 dots in the top right corner</li>
						<li>Click on &quot;Install Chezburger Grades&quot;</li>
					</ul>
				</details>

				<details className="group [&_summary::-webkit-details-marker]:hidden">
					<summary className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white">
						<h2 className="font-medium">
							How do I send feedback regarding Chezburger Grades?
						</h2>

						<svg
							className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</summary>

					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						To send feedback regarding Chezburger Grades, please email{" "}
						<a href="mailto:support@grademelon.org" className="text-primary-500">
							support@grademelon.org
						</a>
						.
					</p>
					<p className="px-4 mt-4 leading-relaxed dark:text-white">
						Or, feel free to join our {" "}
						<a href="https://discord.gg/nwRs8WcQGc" className="text-primary-500">
							Discord
						</a>
						!
					</p>
				</details>
				<details className="group [&_summary::-webkit-details-marker]:hidden">
					<summary className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white">
						<h2 className="font-medium">
							Who&#39;s behind Chezburger Grades?
						</h2>

						<svg
							className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</summary>

					<p className="px-4 mt-4 leading-relaxed dark:text-white">
					Chezburger Grades was originally created by Tinu Vanapamula, but in spring of 2024, Synergy made changes that broke Grade Melon. As a graduating senior, Tinu had other priorities.
					<br></br>
					My name is Jonathan Shapiro. I was a student at Whitman, and in summer 2024, I took it upon myself to restore the project.
					By September, I had things working again, and I&#39;ve been working on expanding and improving it ever since.
						<br></br>
						<br></br>
						You can contact me <a className="text-primary-500" href="https://instagram.com/j.shap06/">@J.shap06</a> on my personal insta, or reach out through the Chezburger Grades discord, insta, etc.
					</p>
				</details>
			</div>
		</div>
	);
}
