import React from "react";
import Banner from "./components/Banner";
import HomeBanner from "./components/HomeBanner";
import RecItems from "../product/RecItems";
import DailyDeals from "../product/DailyDeals";

const HomePage = () => {
    return (
        <div>
            <HomeBanner/>
            <RecItems />
            <Banner />
            <DailyDeals/>
        </div>
    );
}

export default HomePage;