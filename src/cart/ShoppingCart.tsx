import React from 'react';
import { Link } from 'react-router-dom';

const ShoppingCart = () => {
  return (
    <>
      <section className="section-content padding-y">
        <div className="container">
          <div className="row">
            {/* Main content */}
            <main className="col-md-9">
              <div className="card">
                <table className="table table-borderless table-shopping-cart">
                  <thead className="text-muted">
                    <tr className="small text-uppercase">
                      <th scope="col">Product</th>
                      <th scope="col" style={{ width: "120px" }}>Quantity</th>
                      <th scope="col" style={{ width: "120px" }}>Price</th>
                      <th scope="col" className="text-right" style={{ width: "200" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Product 1 */}
                    <tr>
                      <td>
                        <figure className="itemside">
                          <div className="aside">
                            <img src="images/items/1.jpg" className="img-sm" alt="Product 1" />
                          </div>
                          <figcaption className="info">
                            <Link to="#" className="title text-dark">Some name of item goes here nice</Link>
                            <p className="text-muted small">Size: XL, Color: blue, <br /> Brand: Gucci</p>
                          </figcaption>
                        </figure>
                      </td>
                      <td>
                        <select className="form-control" aria-label="Select quantity">
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                        </select>
                      </td>
                      <td>
                        <div className="price-wrap">
                          <var className="price">$1156.00</var>
                          <small className="text-muted"> $315.20 each </small>
                        </div>
                      </td>
                      <td className="text-right">
                        <Link to="#" className="btn btn-light" title="Save to Wishlist" data-toggle="tooltip"><i className="fa fa-heart"></i></Link>
                        <Link to="#" className="btn btn-light">Remove</Link>
                      </td>
                    </tr>
                    {/* Product 2 */}
                    <tr>
                      <td>
                        <figure className="itemside">
                          <div className="aside">
                            <img src="images/items/2.jpg" className="img-sm" alt="Product 2" />
                          </div>
                          <figcaption className="info">
                            <Link to="#" className="title text-dark">Product name goes here nice</Link>
                            <p className="text-muted small">Size: XL, Color: blue, <br /> Brand: Gucci</p>
                          </figcaption>
                        </figure>
                      </td>
                      <td>
                        <select className="form-control" aria-label="Select quantity">
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                        </select>
                      </td>
                      <td>
                        <div className="price-wrap">
                          <var className="price">$149.97</var>
                          <small className="text-muted"> $75.00 each </small>
                        </div>
                      </td>
                      <td className="text-right">
                        <Link to="#" className="btn btn-light" title="Save to Wishlist" data-toggle="tooltip"><i className="fa fa-heart"></i></Link>
                        <Link to="#" className="btn btn-light">Remove</Link>
                      </td>
                    </tr>
                    {/* Product 3 */}
                    <tr>
                      <td>
                        <figure className="itemside">
                          <div className="aside">
                            <img src="images/items/3.jpg" className="img-sm" alt="Product 3" />
                          </div>
                          <figcaption className="info">
                            <Link to="#" className="title text-dark">Another name of some product goes here</Link>
                            <p className="text-muted small">Size: XL, Color: blue, Brand: Tissot</p>
                          </figcaption>
                        </figure>
                      </td>
                      <td>
                        <select className="form-control" aria-label="Select quantity">
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                        </select>
                      </td>
                      <td>
                        <div className="price-wrap">
                          <var className="price">$98.00</var>
                          <small className="text-muted"> $578.00 each </small>
                        </div>
                      </td>
                      <td className="text-right">
                        <Link to="#" className="btn btn-light" title="Save to Wishlist" data-toggle="tooltip"><i className="fa fa-heart"></i></Link>
                        <Link to="#" className="btn btn-light">Remove</Link>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="card-body border-top">
                  <Link to="#" className="btn btn-primary float-md-right">Make Purchase <i className="fa fa-chevron-right"></i></Link>
                  <Link to="#" className="btn btn-light"><i className="fa fa-chevron-left"></i> Continue shopping </Link>
                </div>
              </div>

              <div className="alert alert-success mt-3">
                <p className="icontext"><i className="icon text-success fa fa-truck"></i> Free Delivery within 1-2 weeks</p>
              </div>
            </main>

            {/* Sidebar */}
            <aside className="col-md-3">
              <div className="card mb-3">
                <div className="card-body">
                  <form>
                    <div className="form-group">
                      <label>Have coupon?</label>
                      <div className="input-group">
                        <input type="text" className="form-control" placeholder="Coupon code" />
                        <span className="input-group-append">
                          <button className="btn btn-primary">Apply</button>
                        </span>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <dl className="dlist-align">
                    <dt>Total price:</dt>
                    <dd className="text-right">USD 568</dd>
                  </dl>
                  <dl className="dlist-align">
                    <dt>Discount:</dt>
                    <dd className="text-right">USD 658</dd>
                  </dl>
                  <dl className="dlist-align">
                    <dt>Total:</dt>
                    <dd className="text-right h5"><strong>$1,650</strong></dd>
                  </dl>
                  <hr />
                  <p className="text-center mb-3">
                    <img src="images/misc/payments.png" height="26" alt="Payment Methods" />
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Payment Policy Section */}
      <section className="section-name border-top padding-y">
        <div className="container">
          <h6>Payment and refund policy</h6>
          <p>Lorem ipsum dolor sit amet...</p>
          <p>Lorem ipsum dolor sit amet...</p>
        </div>
      </section>
    </>
  );
};

export default ShoppingCart;