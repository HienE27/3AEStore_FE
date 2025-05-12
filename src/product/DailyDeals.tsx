import React from "react";

const DailyDeals = () => {
  const products = [
    { img: "images/items/9.jpg", discount: "10%", title: "Just another product name", price: "$45", oldPrice: "$90" },
    { img: "images/items/10.jpg", discount: "85%", title: "Some item name here", price: "$45", oldPrice: "$90" },
    { img: "images/items/11.jpg", discount: "10%", title: "Great product name here", price: "$45", oldPrice: "$90" },
    { img: "images/items/12.jpg", discount: "90%", title: "Just another product name", price: "$45", oldPrice: "$90" },
    { img: "images/items/5.jpg", discount: "20%", title: "Just another product name", price: "$45", oldPrice: "$90" },
    { img: "images/items/6.jpg", discount: "20%", title: "Some item name here", price: "$45", oldPrice: "$90" },
  ];

  return (
    <section className="padding-bottom">
      <header className="section-heading mb-4">
        <h3 className="title-section">Daily deals</h3>
      </header>

      <div className="row row-sm">
        {products.map((item, index) => (
          <div key={index} className="col-xl-2 col-lg-3 col-md-4 col-6">
            <div className="card card-sm card-product-grid">
              <a href="/product-detail" className="img-wrap">
                <b className="badge badge-danger mr-1">{item.discount} OFF</b>
                <img src={item.img} alt={item.title} />
              </a>
              <figcaption className="info-wrap">
                <a href="/product-detail" className="title">{item.title}</a>
                <div className="price-wrap">
                  <span className="price">{item.price}</span>
                  <del className="price-old">{item.oldPrice}</del>
                </div>
              </figcaption>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DailyDeals;
