"use client";

import { StakingRewards } from "././_components/StakingRewards"
import type { NextPage } from "next";

const StakingPage: NextPage = () => {
  return (
    <div className="flex items-center flex-col pt-8 sm:pt-10 px-6 lg:px-10 max-w-7xl mx-auto">
      <StakingRewards />
    </div>
  );
};

export default StakingPage;