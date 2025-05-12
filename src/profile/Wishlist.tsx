import React from 'react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  return (
    <>
      {/* ========================= SECTION PAGETOP ========================= */}
      <section className="section-pagetop bg-gray">
        <div className="container">
          <h2 className="title-page">My account</h2>
        </div>
      </section>
      {/* ========================= SECTION PAGETOP END ========================= */}

      {/* ========================= SECTION CONTENT ========================= */}
      <section className="section-content padding-y">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <aside className="col-md-3">
              <nav className="list-group">
                <Link className="list-group-item" to="/profile"> Account overview </Link>
                <Link className="list-group-item" to="/profile/address"> My Address </Link>
                <Link className="list-group-item" to="/profile/orders"> My Orders </Link>
                <Link className="list-group-item active" to="/profile/wishlist">My wishlist </Link>
                <Link className="list-group-item" to="/profile/seller">My Selling Items </Link>
                <Link className="list-group-item" to="/profile/settings"> Settings </Link>
                <Link className="list-group-item" to="/logout"> Log out </Link>
              </nav>
            </aside>

            {/* Main content */}
            <main className="col-md-9">
              {/* Wishlist Items Section */}
              <article className="card mb-3">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <figure className="itemside mb-4">
                        <div className="aside">
                          <img src="images/items/1.jpg" className="border img-md" alt="Product 1" />
                        </div>
                        <figcaption className="info">
                          <Link to="#" className="title">Great Product Name</Link>
                          <p className="price mb-2">$80</p>
                          <Link to="#" className="btn btn-secondary btn-sm"> Add to Cart </Link>
                          <Link to="#" className="btn btn-danger btn-sm" title="Remove from Wishlist">
                            <i className="fa fa-times"></i> 
                          </Link>
                        </figcaption>
                      </figure>
                    </div>

                    <div className="col-md-6">
                      <figure className="itemside mb-4">
                        <div className="aside">
                          <img src="images/items/2.jpg" className="border img-md" alt="Product 2" />
                        </div>
                        <figcaption className="info">
                          <Link to="#" className="title">Winter Jacket</Link>
                          <p className="price mb-2">$1280</p>
                          <Link to="#" className="btn btn-secondary btn-sm"> Add to Cart </Link>
                          <Link to="#" className="btn btn-danger btn-sm" title="Remove from Wishlist">
                            <i className="fa fa-times"></i> 
                          </Link>
                        </figcaption>
                      </figure>
                    </div>

                    <div className="col-md-6">
                      <figure className="itemside mb-4">
                        <div className="aside">
                          <img src="images/items/3.jpg" className="border img-md" alt="Product 3" />
                        </div>
                        <figcaption className="info">
                          <Link to="#" className="title">Book Title</Link>
                          <p className="price mb-2">$280</p>
                          <Link to="#" className="btn btn-secondary btn-sm"> Add to Cart </Link>
                          <Link to="#" className="btn btn-danger btn-sm" title="Remove from Wishlist">
                            <i className="fa fa-times"></i> 
                          </Link>
                        </figcaption>
                      </figure>
                    </div>
                  </div>
                </div>
              </article>
            </main>
          </div>
        </div>
      </section>
    </>
  );
};

export default Wishlist;
