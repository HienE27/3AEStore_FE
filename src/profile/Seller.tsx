import React from 'react';
import { Link } from 'react-router-dom';

const Seller = () => {
  return (
    <>
      <section className="section-pagetop bg-gray">
        <div className="container">
          <h2 className="title-page">My account</h2>
        </div> {/* container // */}
      </section>
      {/* ========================= SECTION PAGETOP END// ========================= */}

      {/* ========================= SECTION CONTENT ========================= */}
      <section className="section-content padding-y">
        <div className="container">
          <div className="row">
            <aside className="col-md-3">
              <nav className="list-group">
                <Link className="list-group-item" to="/profile"> Account overview </Link>
                <Link className="list-group-item" to="/profile/address"> My Address </Link>
                <Link className="list-group-item" to="/profile/orders"> My Orders </Link>
                <Link className="list-group-item" to="/profile/wishlist"> My wishlist </Link>
                <Link className="list-group-item active" to="/profile/seller"> My Selling Items </Link>
                <Link className="list-group-item" to="/profile/settings"> Settings </Link>
                <Link className="list-group-item" to="/logout"> Log out </Link>
              </nav>
            </aside> {/* col.// */}

            <main className="col-md-9">
              <article className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <figure className="card card-product-grid">
                        <div className="img-wrap">
                          <img src="images/items/1.jpg" alt="Product 1" />
                        </div> {/* img-wrap.// */}
                        <figcaption className="info-wrap">
                          <Link to="#" className="title mb-2">Hot sale unisex New Design Shirt for sport polo shirts latest design</Link>
                          <div className="price-wrap mb-3">
                            <span className="price">$32.00-$40.00</span>
                            <small className="text-muted">/per item</small>
                          </div> {/* price-wrap.// */}
                          <Link to="#" className="btn btn-outline-primary"> <i className="fa fa-pen"></i> Edit </Link>
                          <Link to="#" className="btn btn-primary"> <i className="fa fa-eye"></i> View  </Link>
                          <hr />
                          <Link to="#" className="btn btn-success btn-block"> Promote </Link>
                        </figcaption>
                      </figure>
                    </div> {/* col.// */}

                    <div className="col-md-4">
                      <figure className="card card-product-grid">
                        <div className="img-wrap">
                          <img src="images/items/2.jpg" alt="Product 2" />
                        </div> {/* img-wrap.// */}
                        <figcaption className="info-wrap">
                          <Link to="#" className="title mb-2">High Quality Winter PU Rain Jacket with Padding for Men's outdoor</Link>
                          <div className="price-wrap mb-3">
                            <span className="price">$41.00-$50.00</span>
                            <small className="text-muted">/per item</small>
                          </div> {/* price-wrap.// */}
                          <Link to="#" className="btn btn-outline-primary"> <i className="fa fa-pen"></i> Edit </Link>
                          <Link to="#" className="btn btn-primary"> <i className="fa fa-eye"></i> View  </Link>
                          <hr />
                          <Link to="#" className="btn btn-success btn-block"> Promote </Link>
                        </figcaption>
                      </figure>
                    </div> {/* col.// */}

                    <div className="col-md-4">
                      <figure className="card card-product-grid">
                        <div className="img-wrap">
                          <img src="images/items/1.jpg" alt="Product 3" />
                        </div> {/* img-wrap.// */}
                        <figcaption className="info-wrap">
                          <Link to="#" className="title mb-2">Cheap and Best demo clothe with latest Fashion styles for Men</Link>
                          <div className="price-wrap mb-3">
                            <span className="price">$32.00-$40.00</span>
                            <small className="text-muted">/per item</small>
                          </div> {/* price-wrap.// */}
                          <Link to="#" className="btn btn-outline-primary"> <i className="fa fa-pen"></i> Edit </Link>
                          <Link to="#" className="btn btn-primary"> <i className="fa fa-eye"></i> View  </Link>
                          <hr />
                          <Link to="#" className="btn btn-success btn-block"> Promote </Link>
                        </figcaption>
                      </figure>
                    </div> {/* col.// */}

                    <div className="col-md-4">
                      <figure className="card card-product-grid">
                        <div className="img-wrap">
                          <img src="images/items/4.jpg" alt="Product 4" />
                        </div> {/* img-wrap.// */}
                        <figcaption className="info-wrap">
                          <Link to="#" className="title mb-2">Cheap and Best demo clothe with latest Fashion styles for Men</Link>
                          <div className="price-wrap mb-3">
                            <span className="price">$32.00-$40.00</span>
                            <small className="text-muted">/per item</small>
                          </div> {/* price-wrap.// */}
                          <Link to="#" className="btn btn-outline-primary"> <i className="fa fa-pen"></i> Edit </Link>
                          <Link to="#" className="btn btn-primary"> <i className="fa fa-eye"></i> View  </Link>
                          <hr />
                          <Link to="#" className="btn btn-success btn-block"> Promote </Link>
                        </figcaption>
                      </figure>
                    </div> {/* col.// */}

                    <div className="col-md-4">
                      <figure className="card card-product-grid">
                        <div className="img-wrap">
                          <img src="images/items/5.jpg" alt="Product 5" />
                        </div> {/* img-wrap.// */}
                        <figcaption className="info-wrap">
                          <Link to="#" className="title mb-2">Cheap and Best demo clothe with latest Fashion styles for Men</Link>
                          <div className="price-wrap mb-3">
                            <span className="price">$32.00-$40.00</span>
                            <small className="text-muted">/per item</small>
                          </div> {/* price-wrap.// */}
                          <Link to="#" className="btn btn-outline-primary"> <i className="fa fa-pen"></i> Edit </Link>
                          <Link to="#" className="btn btn-primary"> <i className="fa fa-eye"></i> View  </Link>
                          <hr />
                          <Link to="#" className="btn btn-success btn-block"> Promote </Link>
                        </figcaption>
                      </figure>
                    </div> {/* col.// */}
                  </div> {/* row .// */}
                </div> {/* card-body.// */}
              </article>
            </main> {/* col.// */}
          </div>
        </div> {/* container .// */}
      </section>
    </>
  );
};

export default Seller;
