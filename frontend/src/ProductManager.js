import React, { useState, useEffect } from 'react';
import API from './api';

function ProductManager() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { loadData(); }, [search, selectedCategory]);

   const loadData = async () => {
    try {
        let url = `items/`;
        const params = [];
        if (search) params.push(`search=${search}`);
        if (selectedCategory) params.push(`category=${selectedCategory}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const prodRes = await API.get(url);
        setProducts(prodRes.data);

        const catRes = await API.get('categories/');
        setCategories(catRes.data);
    } catch (err) {
        console.error("Error loading data:", err);
    }
};


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('category', category);
        if (image) formData.append('image', image);

        if (editingId) {
            await API.put(`items/${editingId}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setEditingId(null);
        } else {
            await API.post('items/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        resetForm();
        loadData();
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        await API.post('categories/', { name: newCategoryName });
        setNewCategoryName('');
        loadData();
    };

    const handleEditClick = (p) => {
        setEditingId(p.id); setName(p.name); setDescription(p.description || ''); setPrice(p.price); setStock(p.stock); setCategory(p.category || '');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this product?")) {
            await API.delete(`items/${id}/`);
            loadData();
        }
    };

    const resetForm = () => {
        setName(''); setDescription(''); setPrice(''); setStock(''); setCategory(''); setImage(null);
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center' }}>Mini Product Management</h1>
            
            {/* Manage Categories */}
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
                <h3>Manage Categories</h3>
                <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Category Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required style={{ padding: '8px', flex: 1 }} />
                    <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none' }}>Add</button>
                </form>
            </div>

            {/* Add / Edit Product */}
            <div style={{ border: '1px solid #ccc', padding: '25px', marginBottom: '20px', borderRadius: '5px' }}>
                <h3>{editingId ? "Edit Product Details" : "Add New Product"}</h3>
                <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input type="text" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '8px' }} />
                    <input type="number" placeholder="Price (\$)" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: '8px' }} />
                    <input type="number" placeholder="Stock/Inventory Level" value={stock} onChange={e => setStock(e.target.value)} required style={{ padding: '8px' }} />
                    <select value={category} onChange={e => setCategory(e.target.value)} required style={{ padding: '8px' }}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '8px', gridColumn: '1 / span 2', height: '60px' }} />
                    <input type="file" onChange={e => setImage(e.target.files[0])} style={{ gridColumn: '1 / span 2' }} />
                    <button type="submit" style={{ gridColumn: '1 / span 2', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', fontSize: '16px', fontWeight: 'bold' }}>
                        {editingId ? "Update Product" : "Add Product"}
                    </button>
                </form>
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <input type="text" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '10px', flex: 2 }} />
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ padding: '10px', flex: 1 }}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Product List Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
                        <th style={{ padding: '10px' }}>Image</th>
                        <th style={{ padding: '10px' }}>Name</th>
                        <th style={{ padding: '10px' }}>Category</th>
                        <th style={{ padding: '10px' }}>Price</th>
                        <th style={{ padding: '10px' }}>Stock</th>
                        <th style={{ padding: '10px' }}>Sales Info</th>
                        <th style={{ padding: '10px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #ccc', textAlign: 'center' }}>
                            <td style={{ padding: '10px' }}>
                                {p.image ? <img src={p.image} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover' }} /> : 'No Image'}
                            </td>
                            <td style={{ padding: '10px' }}><strong>{p.name}</strong></td>
                            <td style={{ padding: '10px' }}>{p.category_name}</td>
                            <td style={{ padding: '10px', color: 'green', fontWeight: 'bold' }}>\${p.price}</td>
                            <td style={{ padding: '10px' }}>{p.stock} units</td>
                            <td style={{ padding: '10px', fontStyle: 'italic' }}>{p.sales_count} sold</td>
                            <td style={{ padding: '10px' }}>
                                <button onClick={() => handleEditClick(p)} style={{ backgroundColor: '#ffc107', marginRight: '5px', border: 'none', padding: '5px 10px' }}>Edit</button>
                                <button onClick={() => handleDelete(p.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default ProductManager;
