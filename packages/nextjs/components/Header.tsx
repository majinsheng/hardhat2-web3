"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { 
  ArrowPathIcon, 
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  BanknotesIcon, 
  Bars3Icon, 
  BuildingLibraryIcon, 
  CubeIcon, 
  DocumentDuplicateIcon, 
  HandThumbUpIcon, 
  ListBulletIcon, 
  PuzzlePieceIcon, 
  SparklesIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  subMenus?: HeaderMenuLink[];
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Contracts",
    href: "/debug",
    icon: <DocumentDuplicateIcon className="h-4 w-4" />,
  },
  {
    label: "Sample NFT",
    href: "",
    icon: <PuzzlePieceIcon className="h-4 w-4" />,
    subMenus: [
      {
        label: "My NFTs",
        href: "/myNFTs",
        icon: <ListBulletIcon className="h-4 w-4" />,
      },
      {
        label: "Transfer History",
        href: "/transfers",
        icon: <ArrowPathIcon className="h-4 w-4" />,
      },
      {
        label: "IPFS Upload",
        href: "/ipfsUpload",
        icon: <ArrowUpTrayIcon className="h-4 w-4" />,
      },
      {
        label: "IPFS Download",
        href: "/ipfsDownload",
        icon: <ArrowDownTrayIcon className="h-4 w-4" />,
      }
    ]
  },
  {
    label: "Staking",
    href: "/staking",
    icon: <SparklesIcon className="h-4 w-4" />,
  },
  {
    label: "Vendor",
    href: "/token-vendor",
    icon: <BuildingLibraryIcon className="h-4 w-4" />,
  },
  {
    label: "Dice",
    href: "/dice-game",
    icon: <CubeIcon className="h-4 w-4" />,
  },
  {
    label: "Ballot",
    href: "/ballot",
    icon: <HandThumbUpIcon className="h-4 w-4" />,
  },
  {
    label: "DEX",
    href: "/dex",
    icon: <BanknotesIcon className="h-4 w-4" />,
  }
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon, subMenus }) => {
        const isActive = pathname === href;
        if (subMenus && subMenus.length > 0) {
          return (
            <li key={`key_${label}`}>
              <details>
                <summary>
                  {icon}
                  <span>{label}</span>
                </summary>
                <ul>
                  {subMenus.map(({ label, href, icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        passHref
                        className={`flex items-center w-40 gap-2 py-1.5 px-3 text-sm hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral`}
                      >
                        {icon}
                        <span>{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        } else {
          return (
            <li key={href}>
              <Link
                href={href}
                passHref
                className={`${isActive ? "bg-secondary shadow-md" : ""
                  } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            </li>
          );
        }
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="EM logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">EM-WEB3</span>
            <span className="text-xs">Hardhat - NextJs</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4">
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
