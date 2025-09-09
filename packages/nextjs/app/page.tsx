"use client";

import Image from "next/image";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <div className="card card-side bg-base-100 shadow-sm">
            <figure>
              <Image src="/AboutMe.png" alt="About Me" />
            </figure>
            <div className="card-body">
              <h2 className="card-title">About Me</h2>
              <ul className="mt-6 flex flex-col gap-2 text-md">
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 me-2 inline-block text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    Full-stack developer with strong expertise in modern web technologies and distributed systems.
                    Skilled in designing and scaling applications across frontend and backend stacks.
                  </span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 me-2 inline-block text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    Eager to apply these skills in the Web3 ecosystem, focusing on decentralized applications, smart
                    contracts, and blockchain integrations.
                  </span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 me-2 inline-block text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    Passionate about learning new technologies and contributing to open, decentralized platforms.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
