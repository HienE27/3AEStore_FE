import React from 'react';
import { Link } from 'react-router-dom';

const Main = () => {
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
                <Link className="list-group-item active" to="/profile"> Account overview </Link>
                <Link className="list-group-item" to="/profile/address"> My Address </Link>
                <Link className="list-group-item" to="/profile/orders"> My Orders </Link>
                <Link className="list-group-item" to="/profile/wishlist"> My wishlist </Link>
                <Link className="list-group-item" to="/profile/seller"> My Selling Items </Link>
                <Link className="list-group-item" to="/profile/settings"> Settings </Link>
                <Link className="list-group-item" to="/logout"> Log out </Link>
              </nav>
            </aside>

            {/* Main content */}
            <main className="col-md-9">
              {/* User Info Card */}
              <article className="card mb-3">
                <div className="card-body">
                  <figure className="icontext">
                    <div className="icon">
                      <img className="rounded-circle img-sm border" src="images/avatars/avatar3.jpg" alt="User Avatar" />
                    </div>
                    <div className="text">
                      <strong> Mr. Jackson Someone </strong> <br />
                      <p className="mb-2"> myloginname@gmail.com </p>
                      <Link to="#" className="btn btn-light btn-sm">Edit</Link>
                    </div>
                  </figure>
                  <hr />
                  <p>
                    <i className="fa fa-map-marker text-muted"></i> &nbsp; My address:  
                    <br />
                    Tashkent city, Street name, Building 123, House 321 &nbsp; 
                    <Link to="#" className="btn-link"> Edit</Link>
                  </p>

                  {/* Stats Card Group */}
                  <article className="card-group card-stat">
                    <figure className="card bg">
                      <div className="p-3">
                        <h4 className="title">38</h4>
                        <span>Orders</span>
                      </div>
                    </figure>
                    <figure className="card bg">
                      <div className="p-3">
                        <h4 className="title">5</h4>
                        <span>Wishlists</span>
                      </div>
                    </figure>
                    <figure className="card bg">
                      <div className="p-3">
                        <h4 className="title">12</h4>
                        <span>Awaiting delivery</span>
                      </div>
                    </figure>
                    <figure className="card bg">
                      <div className="p-3">
                        <h4 className="title">50</h4>
                        <span>Delivered items</span>
                      </div>
                    </figure>
                  </article>
                </div>
              </article>

              {/* Recent Orders Card */}
              <article className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title mb-4">Recent orders </h5>  

                  <div className="row">
                    <div className="col-md-6">
                      <figure className="itemside mb-3">
                        <div className="aside">
                          <img src="images/items/1.jpg" className="border img-sm" alt="Item" />
                        </div>
                        <figcaption className="info">
                          <time className="text-muted"><i className="fa fa-calendar-alt"></i> 12.09.2019</time>
                          <p>Great book name goes here </p>
                          <span className="text-success">Order confirmed </span>
                        </figcaption>
                      </figure>
                    </div>
                    <div className="col-md-6">
                      <figure className="itemside mb-3">
                        <div className="aside">
                          <img src="images/items/2.jpg" className="border img-sm" alt="Item" />
                        </div>
                        <figcaption className="info">
                          <time className="text-muted"><i className="fa fa-calendar-alt"></i> 12.09.2019</time>
                          <p>How to be rich</p>
                          <span className="text-success">Departured</span>
                        </figcaption>
                      </figure>
                    </div>
                    <div className="col-md-6">
                      <figure className="itemside mb-3">
                        <div className="aside">
                          <img src="images/items/3.jpg" className="border img-sm" alt="Item" />
                        </div>
                        <figcaption className="info">
                          <time className="text-muted"><i className="fa fa-calendar-alt"></i> 12.09.2019</time>
                          <p>Harry Potter book </p>
                          <span className="text-success">Shipped</span>
                        </figcaption>
                      </figure>
                    </div>
                  </div>

                  <Link to="#" className="btn btn-outline-primary btn-block"> See all orders <i className="fa fa-chevron-down"></i> </Link>
                </div>
              </article>

            </main>
          </div>
        </div>
      </section>
    </>
  );
};

export default Main;
