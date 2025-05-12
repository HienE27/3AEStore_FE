import React from 'react';
import { Link } from 'react-router-dom';

const List = () => {
  return (
    <>
      {/* Filter Section */}
      <section className="section-content padding-y">
        <div className="container">
          {/* Filter Top */}
          <div className="card mb-3">
            <div className="card-body">
              <ol className="breadcrumb float-left">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="#">Category name</Link></li>
                <li className="breadcrumb-item active">Item details</li>
              </ol>
            </div>
          </div>

          <div className="row">
            {/* Sidebar Filters */}
            <aside className="col-md-2">
              <FilterGroup title="Product type" id="collapse_1">
                <ul className="list-menu">
                  <li><Link to="#">Shorts</Link></li>
                  <li><Link to="#">Trousers</Link></li>
                  <li><Link to="#">Sweaters</Link></li>
                  <li><Link to="#">Clothes</Link></li>
                  <li><Link to="#">Home items</Link></li>
                  <li><Link to="#">Jackets</Link></li>
                  <li><Link to="#">Somethings</Link></li>
                </ul>
              </FilterGroup>
              
              <FilterGroup title="Brands" id="collapse_2">
                <Checkbox label="Adidas" count={120} checked />
                <Checkbox label="Nike" count={15} checked />
                <Checkbox label="The North Face" count={35} checked />
                <Checkbox label="The Cat" count={89} checked />
                <Checkbox label="Honda" count={30} checked />
              </FilterGroup>

              <FilterGroup title="Price range" id="collapse_3">
                <div className="inner">
                  <label htmlFor="priceRange" className="sr-only">Price Range</label>
                  <input id="priceRange" type="range" className="custom-range" min="0" max="100" name="" title="Select price range" />
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label>Min</label>
                      <input className="form-control" placeholder="$0" type="number" />
                    </div>
                    <div className="form-group text-right col-md-6">
                      <label>Max</label>
                      <input className="form-control" placeholder="$1,0000" type="number" />
                    </div>
                  </div>
                  <button className="btn btn-block btn-primary">Apply</button>
                </div>
              </FilterGroup>

              <FilterGroup title="Sizes" id="collapse_4">
                <CheckboxButton label="XS" />
                <CheckboxButton label="SM" />
                <CheckboxButton label="LG" />
                <CheckboxButton label="XXL" />
              </FilterGroup>

              <FilterGroup title="Condition" id="collapse_5">
                <Radio label="Any condition" name="myfilter_radio" checked />
                <Radio label="Brand new" name="myfilter_radio" checked />
                <Radio label="Used items" name="myfilter_radio" checked/>
                <Radio label="Very old" name="myfilter_radio" checked/>
              </FilterGroup>
            </aside>

            {/* Main Product List */}
            <main className="col-md-10">
              <header className="mb-3">
                <div className="form-inline">
                  <strong className="mr-md-auto">32 Items found</strong>
                  <label htmlFor="sortOptions" className="sr-only">Sort Options</label>
                  <select id="sortOptions" className="mr-2 form-control" aria-label="Sort Options">
                    <option>Latest items</option>
                    <option>Trending</option>
                    <option>Most Popular</option>
                    <option>Cheapest</option>
                  </select>
                  <div className="btn-group">
                    <Link to="page-listing-grid.html" className="btn btn-light" data-toggle="tooltip" title="List view">
                      <i className="fa fa-bars"></i>
                    </Link>
                    <Link to="page-listing-large.html" className="btn btn-light active" data-toggle="tooltip" title="Grid view">
                      <i className="fa fa-th"></i>
                    </Link>
                  </div>
                </div>
              </header>

              {/* Example Product Card */}
              <ProductCard
                imgSrc="images/items/1.jpg"
                title="Hot sale unisex New Design Shirt"
                price="$25.00-$40.00"
                description="Take it as demo specs, ipsum dolor sit amet..."
                tags={['Verified', '5 Years', '80 reviews', 'Russia']}
                rating={5}
              />

              {/* Pagination */}
              <nav className="mb-4" aria-label="Page navigation sample">
                <ul className="pagination">
                  <li className="page-item disabled"><Link className="page-link" to="#">Previous</Link></li>
                  <li className="page-item active"><Link className="page-link" to="#">1</Link></li>
                  <li className="page-item"><Link className="page-link" to="#">2</Link></li>
                  <li className="page-item"><Link className="page-link" to="#">3</Link></li>
                  <li className="page-item"><Link className="page-link" to="#">Next</Link></li>
                </ul>
              </nav>

              <div className="box text-center">
                <p>Did you find what you were looking for?</p>
                <button className="btn btn-light">Yes</button>
                <button className="btn btn-light">No</button>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
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

// Filter Group Component
const FilterGroup: React.FC<{ title: string; id: string; children: React.ReactNode }> = ({ title, id, children }) => (
  <article className="filter-group">
    <h6 className="title">
      <Link to="#" className="dropdown-toggle" data-toggle="collapse" data-target={`#${id}`}>{title}</Link>
    </h6>
    <div className="filter-content collapse show" id={id}>
      <div className="inner">{children}</div>
    </div>
  </article>
);

// Checkbox Component
const Checkbox: React.FC<{ label: string; count?: number; checked: boolean }> = ({ label, count, checked }) => (
  <label className="custom-control custom-checkbox">
    <input type="checkbox" className="custom-control-input" defaultChecked={checked} />
    <div className="custom-control-label">
      {label}
      {count && <b className="badge badge-pill badge-light float-right">{count}</b>}
    </div>
  </label>
);

// Checkbox Button Component
const CheckboxButton: React.FC<{ label: string }> = ({ label }) => (
  <label className="checkbox-btn">
    <input type="checkbox" />
    <span className="btn btn-light">{label}</span>
  </label>
);

// Radio Component
const Radio: React.FC<{ label: string; name: string; checked: boolean }> = ({ label, name, checked }) => (
  <label className="custom-control custom-radio">
    <input type="radio" name={name} className="custom-control-input" defaultChecked={checked} />
    <div className="custom-control-label">{label}</div>
  </label>
);

// Product Card Component
// Define the props interface for ProductCard
interface ProductCardProps {
  imgSrc: string;
  title: string;
  price: string;
  description: string;
  tags: string[];
  rating: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ imgSrc, title, price, description, tags, rating }) => (
  <article className="card card-product-list">
    <div className="row no-gutters">
      <aside className="col-md-3">
        <Link to="#" className="img-wrap">
          <span className="badge badge-danger">NEW</span>
          <img src={imgSrc} alt={title} />
        </Link>
      </aside>
      <div className="col-md-6">
        <div className="info-main">
          <Link to="#" className="h5 title">{title}</Link>
          <div className="rating-wrap mb-2">
            <ul className="rating-stars">
              <li style={{ width: `${rating * 20}%` }} className="stars-active">
                {Array.from({ length: 5 }, (_, i) => <i key={i} className="fa fa-star"></i>)}
              </li>
              <li>
                {Array.from({ length: 5 }, (_, i) => <i key={i} className="fa fa-star"></i>)}
              </li>
            </ul>
          </div>
          <p className="mb-3">
            {tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </p>
          <p>{description}</p>
        </div>
      </div>
      <aside className="col-sm-3">
        <div className="info-aside">
          <div className="price-wrap">
            <span className="h5 price">{price}</span>
            <small className="text-muted">/per item</small>
          </div>
        </div>
      </aside>
    </div>
  </article>
);

export default List;