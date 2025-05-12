import React from "react";

const Banner = () => {
    return (
        <div>
            <section className="padding-bottom">
                <div className="row">
                    <aside className="col-md-6">
                        <div className="card card-banner-lg bg-dark">
                            <img src="images/banners/banner4.jpg" className="card-img opacity" alt="Banner 4" />
                            <div className="card-img-overlay text-white">
                                <h2 className="card-title">Big Deal on Clothes</h2>
                                <p className="card-text" style={{ maxWidth: "80%" }}>
                                    This is a wider card with text below and Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab quae nihil praesentium impedit libero possimus id vero
                                </p>
                                <button className="btn btn-light">Discover</button>
                            </div>
                        </div>
                    </aside>
                    <div className="col-md-6">
                        <div className="card card-banner-lg bg-dark">
                            <img src="images/banners/banner5.jpg" className="card-img opacity" alt="Banner 5" />
                            <div className="card-img-overlay text-white">
                                <h2 className="card-title">Great Bundle for You</h2>
                                <p className="card-text" style={{ maxWidth: "80%" }}>
                                    Card with text below and Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab quae nihil praesentium impedit libero possimus id vero
                                </p>
                                <button className="btn btn-light">Discover</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Banner;
