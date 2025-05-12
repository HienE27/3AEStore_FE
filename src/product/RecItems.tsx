import React from "react";

const RecItems = () => {
  return (
    <div>
      <section className="padding-bottom">
        <header className="section-heading mb-4">
          <h3 className="title-section">Recommended items</h3>
        </header>

        <div className="row">
          {[
            {
              img: "images/items/1.jpg",
              category: "Clothes",
              title: "Men's T-shirt for summer",
              price: "$99",
            },
            {
              img: "images/items/2.jpg",
              category: "Clothes",
              title: "Winter Jacket for Men, All sizes",
              price: "$19",
            },
            {
              img: "images/items/3.jpg",
              category: "Clothes",
              title: "Jeans Shorts for Boys Small size",
              price: "$56",
            },
            {
              img: "images/items/4.jpg",
              category: "Clothes",
              title: "Jeans Shorts for Boys Small size",
              price: "$56",
            },
            {
              img: "images/items/5.jpg",
              category: "Luxury",
              title: "Leather Wallet Brown Style",
              price: "$56",
            },
            {
              img: "images/items/6.jpg",
              category: "Interior",
              title: "Sofa for Minimalist Interior",
              price: "$56",
            },
            {
              img: "images/items/7.jpg",
              category: "Clothes",
              title: "Amazing item name comes here",
              price: "$56",
            },
            {
              img: "images/items/8.jpg",
              category: "Clothes",
              title: "Great product name is here",
              price: "$56",
            },
            {
              img: "images/items/1.jpg",
              category: "Clothes",
              title: "Men's T-shirt for summer",
              price: "$99",
            },
            {
              img: "images/items/2.jpg",
              category: "Clothes",
              title: "Winter Jacket for Men, All sizes",
              price: "$19",
            },
            {
              img: "images/items/3.jpg",
              category: "Clothes",
              title: "Jeans Shorts for Boys Small size",
              price: "$56",
            },
            {
              img: "images/items/8.jpg",
              category: "Clothes",
              title: "Great product name is here",
              price: "$56",
            },
          ].map((item, index) => (
            <div key={index} className="col-xl-3 col-lg-3 col-md-4 col-6">
              <div className="card card-product-grid">
                <a href="/product-detail" className="img-wrap">
                  <img src={item.img} alt={item.title} />
                </a>
                <figcaption className="info-wrap">
                  <ul className="rating-stars mb-1">
                    <li style={{ width: "80%" }} className="stars-active">
                      <img
                        src="images/icons/stars-active.svg"
                        alt="Active rating stars"
                      />
                    </li>
                    <li>
                      <img
                        src="images/icons/starts-disable.svg"
                        alt="Inactive rating stars"
                      />
                    </li>
                  </ul>
                  <div>
                    <a href="/category" className="text-muted">
                      {item.category}
                    </a>
                    <a href="/product-detail" className="title">
                      {item.title}
                    </a>
                  </div>
                  <div className="price h5 mt-2">{item.price}</div>
                </figcaption>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RecItems;
