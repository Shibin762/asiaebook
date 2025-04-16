import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import { toast } from 'react-toastify';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css'; 
import 'slick-carousel/slick/slick-theme.css';
import 'react-toastify/dist/ReactToastify.css';
import clothingBanner1 from "../images/banner01.webp"; // Updated image imports
import clothingBanner2 from "../images/banner01.webp";
import clothingBanner3 from "../images/banner01.webp";
import "./AsiaHomepage.css";

const AsiaHomepage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useCart();
    const [categories, setCategories] = useState([]);
    const [checked, setChecked] = useState([]);
    const [radio, setRadio] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [sliderImages, setSliderImages] = useState([clothingBanner1, clothingBanner2, clothingBanner3]);

    // Get all categories
    const getAllCategory = async () => {
        try {
            const { data } = await axios.get("/api/v1/category/get-category");
            if (data?.success) {
                setCategories(data?.category);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllCategory();
        getTotal();
    }, []);

    // Get total count of products
    const getTotal = async () => {
        try {
            const { data } = await axios.get("/api/v1/product/product-count");
            setTotal(data?.total);
        } catch (error) {
            console.log(error);
        }
    };

    // Get products
    const getAllProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
            setLoading(false);
            setProducts(data.products);
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    useEffect(() => {
        getAllProducts();
    }, [page]);

    // Load more products
    const loadMore = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
            setLoading(false);
            setProducts([...products, ...data?.products]);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (page === 1) return;
        loadMore();
    }, [page, loadMore]);

    // Filter products by category and price
    useEffect(() => {
        if (!checked.length || !radio.length) getAllProducts();
    }, [checked.length, radio.length]);

    useEffect(() => {
        if (checked.length || radio.length) filterProduct();
    }, [checked, radio]);

    const handleFilter = (value, id) => {
        let all = [...checked];
        if (value) {
            all.push(id);
        } else {
            all = all.filter((c) => c !== id);
        }
        setChecked(all);
    };

    const filterProduct = async () => {
        try {
            const { data } = await axios.post("/api/v1/product/product-filters", {
                checked,
                radio,
            });
            setProducts(data?.products);
        } catch (error) {
            console.log(error);
        }
    };

    // Slider settings
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        adaptiveHeight: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    adaptiveHeight: false,
                    autoplay: true
                }
            }
        ]
    };

    return (
        <div className="container-fluid mt-3">
            {/* Fashion Slider */}
            <div className="col-md-12 slider-container">
                <Slider {...sliderSettings}>
                    {sliderImages.map((image, index) => (
                        <div key={index}>
                            <img
                                src={image}
                                alt={`Fashion Banner ${index + 1}`}
                                style={{ width: "100%", height: "500px", objectFit: "cover" }}
                            />
                        </div>
                    ))}
                </Slider>
            </div>

            <div className="row mt-4">
                {/* Filter Section */}
                <div className="col-md-3">
                    <div className="filter-section">
                        <h4 className="text-center">Shop By Category</h4>
                        <div className="d-flex flex-column">
                            {categories?.map((c) => (
                                <Checkbox
                                    key={c._id}
                                    onChange={(e) => handleFilter(e.target.checked, c._id)}
                                >
                                    {c.name}
                                </Checkbox>
                            ))}
                        </div>
                        
                        <h4 className="text-center mt-4">Shop By Price</h4>
                        <div className="d-flex flex-column">
                            <Radio.Group onChange={(e) => setRadio(e.target.value)}>
                                {Prices?.map((p) => (
                                    <div key={p._id}>
                                        <Radio value={p.array}>{p.name}</Radio>
                                    </div>
                                ))}
                            </Radio.Group>
                        </div>
                        
                        <div className="d-flex flex-column mt-4">
                            <button
                                className="btn btn-dark"
                                onClick={() => window.location.reload()}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="col-md-9">
                    <div className="page-header">
                        <h1>Our Fashion Collection</h1>
                    </div>
                    
                    <div className="d-flex flex-wrap justify-content-start">
                        {products?.map((p) => (
                            <div className="card m-2" style={{ width: "22rem" }} key={p._id}>
                                <img
                                    src={`/api/v1/product/product-photo/${p._id}`}
                                    className="card-img-top"
                                    alt={p.name}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{p.name}</h5>
                                    <p className="card-text">
                                        {p.description.substring(0, 50)}...
                                    </p>
                                    <p className="card-text fw-bold">€{p.price}</p>
                                    <div className="d-flex justify-content-between">
                                        <button
                                            className="btn btn-more-details"
                                            onClick={() => navigate(`/product/${p.slug}`)}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            className="btn btn-add-to-cart"
                                            onClick={() => {
                                                setCart([...cart, p]);
                                                localStorage.setItem(
                                                    "cart",
                                                    JSON.stringify([...cart, p])
                                                );
                                                toast.success("Item added to cart");
                                            }}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="m-4 text-center">
                        {products && products.length < total && (
                            <button
                                className="btn btn-warning"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setPage(page + 1);
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Loading...
                                    </>
                                ) : (
                                    "Load More"
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsiaHomepage;