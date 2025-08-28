import React from "react";
import Banner from "./components/Banner";
import HomeBanner from "./components/HomeBanner";
import DailyDeals from "../product/DailyDeals";
import ProductList from "../product/ProductList";
import NewsList from "../news/NewsList";
import ProductNew from "../product/ProductNew";

const HomePage = () => {
    return (
        <div>
            <HomeBanner/>
            <Banner />
            <ProductNew />
            <ProductList />
            <NewsList />
            <DailyDeals/>
        </div>
    );
}

export default HomePage;