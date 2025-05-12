import React from 'react';
import { Link } from 'react-router-dom';

const Detail = () => {
  return (
    <>
      <section className="py-3 bg-light">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/category">Category name</Link></li>
            <li className="breadcrumb-item"><Link to="/subcategory">Sub category</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Items</li>
          </ol>
        </div>
      </section>

      {/* ========================= SECTION CONTENT ========================= */}
      <section className="section-content bg-white padding-y">
        <div className="container">

          {/* ============================ ITEM DETAIL ======================== */}
          <div className="row">
            {/* Product Images Section */}
            <aside className="col-md-6">
              <div className="card">
                <article className="gallery-wrap">
                  <div className="img-big-wrap">
                    <div> <a href="#"><img src="images/items/15.jpg" alt="Product" /></a></div>
                  </div>
                  <div className="thumbs-wrap">
                    <a href="#" className="item-thumb"> <img src="images/items/15.jpg" alt="Thumbnail" /></a>
                    <a href="#" className="item-thumb"> <img src="images/items/15-1.jpg" alt="Thumbnail" /></a>
                    <a href="#" className="item-thumb"> <img src="images/items/15-2.jpg" alt="Thumbnail" /></a>
                    <a href="#" className="item-thumb"> <img src="images/items/15-1.jpg" alt="Thumbnail" /></a>
                  </div>
                </article>
              </div>
            </aside>

            {/* Product Details Section */}
            <main className="col-md-6">
              <article className="product-info-aside">
                <h2 className="title mt-3">Hot sale unisex New Design Shoe</h2>

                <div className="rating-wrap my-3">
                  <ul className="rating-stars">
                    <li style={{ width: '80%' }} className="stars-active">
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                    </li>
                    <li>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                    </li>
                  </ul>
                  <small className="label-rating text-muted">132 reviews</small>
                  <small className="label-rating text-success"><i className="fa fa-clipboard-check"></i> 154 orders</small>
                </div>

                <div className="mb-3">
                  <var className="price h4">USD 465.00</var>
                  <span className="text-muted">USD 562.65 incl. VAT</span>
                </div>

                <p>Compact sport shoe for running, consectetur adipisicing elit...</p>

                <dl className="row">
                  <dt className="col-sm-3">Manufacturer</dt>
                  <dd className="col-sm-9"><Link to="#">Great textile Ltd.</Link></dd>
                  <dt className="col-sm-3">Article number</dt>
                  <dd className="col-sm-9">596 065</dd>
                  <dt className="col-sm-3">Guarantee</dt>
                  <dd className="col-sm-9">2 years</dd>
                  <dt className="col-sm-3">Delivery time</dt>
                  <dd className="col-sm-9">3-4 days</dd>
                  <dt className="col-sm-3">Availability</dt>
                  <dd className="col-sm-9">In Stock</dd>
                </dl>

                <div className="form-row mt-4">
                  <div className="form-group col-md flex-grow-0">
                    <div className="input-group mb-3">
                      <div className="input-group-prepend">
                        <button className="btn btn-light" type="button">+</button>
                      </div>
                      <input type="text" className="form-control" value="1" readOnly title="Quantity" />
                      <div className="input-group-append">
                        <button className="btn btn-light" type="button">−</button>
                      </div>
                    </div>
                  </div>
                  <div className="form-group col-md">
                    <button className="btn btn-primary">
                      <i className="fas fa-shopping-cart"></i> Add to cart
                    </button>
                    <button className="btn btn-light ml-2">
                      <i className="fas fa-envelope"></i> Contact supplier
                    </button>
                  </div>
                </div>
              </article>
            </main>
          </div>
        </div>
      </section>

      {/* ========================= SECTION SUBSCRIBE ========================= */}
      <section className="padding-y-lg bg-light border-top">
        <div className="container">
          <p className="pb-2 text-center">Delivering the latest product trends and industry news straight to your inbox</p>
          <div className="row justify-content-md-center">
            <div className="col-lg-4 col-sm-6">
              <form className="form-row">
                <div className="col-8">
                  <input className="form-control" placeholder="Your Email" type="email" />
                </div>
                <div className="col-4">
                  <button type="submit" className="btn btn-block btn-warning">
                    <i className="fa fa-envelope"></i> Subscribe
                  </button>
                </div>
              </form>
              <small className="form-text">We’ll never share your email address with a third-party.</small>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Detail;