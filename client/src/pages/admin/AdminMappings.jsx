import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import Layout from '../../components/shared/Layout';
import { FaBuilding, FaHotel, FaPlus, FaTrash, FaUserTie, FaSync, FaSitemap } from 'react-icons/fa';
import './AdminMappings.css';

const AdminMappings = () => {
    const { addToast } = useToast();
    const [deptMentors, setDeptMentors] = useState([]);
    const [hostelWardens, setHostelWardens] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [availableDepts, setAvailableDepts] = useState([]);
    const [availableHostels, setAvailableHostels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dept'); // 'dept' or 'hostel'

    // Form states
    const [deptForm, setDeptForm] = useState({ department: '', faculty_id: '' });
    const [hostelForm, setHostelForm] = useState({ hostel_name: '', floor: '', faculty_id: '' });
    const [newDeptName, setNewDeptName] = useState('');

    useEffect(() => {
        fetchMappings();
        fetchFaculty();
        fetchDynamicData();
    }, []);

    const fetchMappings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/mappings');
            setDeptMentors(res.data.deptMentors);
            setHostelWardens(res.data.hostelWardens);
        } catch (err) {
            addToast('Failed to fetch mappings', 'error');
        }
    };

    const fetchFaculty = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users');
            setFaculty(res.data.faculty);
        } catch (err) {
            addToast('Failed to fetch faculty members', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDynamicData = async () => {
        try {
            const [deptsRes, hostelsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/departments'),
                axios.get('http://localhost:5000/api/admin/hostels')
            ]);
            setAvailableDepts(deptsRes.data);
            setAvailableHostels(hostelsRes.data);
        } catch (err) {
            console.error('Failed to fetch dynamic dropdown data', err);
        }
    };

    const handleAddDeptMapping = async (e) => {
        e.preventDefault();
        if (!deptForm.department || !deptForm.faculty_id) {
            addToast('Please fill all department fields', 'error');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/admin/dept-mentor', deptForm);
            addToast('Department mentor mapping updated', 'success');
            setDeptForm({ department: '', faculty_id: '' });
            fetchMappings();
        } catch (err) {
            addToast('Failed to update mapping', 'error');
        }
    };

    const handleAddWardenMapping = async (e) => {
        e.preventDefault();
        if (!hostelForm.hostel_name || !hostelForm.floor || !hostelForm.faculty_id) {
            addToast('Please fill all hostel fields', 'error');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/admin/hostel-warden', hostelForm);
            addToast('Hostel warden mapping updated', 'success');
            setHostelForm({ hostel_name: '', floor: '', faculty_id: '' });
            fetchMappings();
        } catch (err) {
            addToast('Failed to update mapping', 'error');
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('Are you sure you want to delete this mapping?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/mappings/${type}/${id}`);
            addToast('Mapping deleted successfully', 'success');
            fetchMappings();
        } catch (err) {
            addToast('Failed to delete mapping', 'error');
        }
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;
        try {
            await axios.post('http://localhost:5000/api/admin/departments', { dept_name: newDeptName });
            addToast('Department added successfully', 'success');
            setNewDeptName('');
            fetchDynamicData();
        } catch (err) {
            addToast('Failed to add department', 'error');
        }
    };

    const handleRecalculate = async () => {
        if (!window.confirm('This will update assignments for ALL existing students based on these rules. Continue?')) return;
        try {
            const res = await axios.post('http://localhost:5000/api/admin/recalculate-assignments');
            addToast(res.data.message, 'success');
        } catch (err) {
            addToast('Failed to recalculate assignments', 'error');
        }
    };

    if (isLoading) {
        return (
            <Layout title="Assign Faculty">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Assign Faculty">
            <div className="rules-container fade-in">
                <div className="rules-header">
                    <div>
                        <h2>Assign Faculty</h2>
                        <p>Configure automatic mentor and warden assignments for students</p>
                    </div>
                    <button onClick={handleRecalculate} className="apply-btn">
                        <FaSync /> Apply Rules to All Students
                    </button>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <button
                        onClick={() => setActiveTab('dept')}
                        className={`tab-btn ${activeTab === 'dept' ? 'active' : ''}`}
                    >
                        <FaBuilding /> Department Mentors
                    </button>
                    <button
                        onClick={() => setActiveTab('hostel')}
                        className={`tab-btn ${activeTab === 'hostel' ? 'active' : ''}`}
                    >
                        <FaHotel /> Hostel Wardens
                    </button>
                </div>

                <div className="rules-grid">
                    {/* Form Section */}
                    <div className="rule-card">
                        <h3>
                            <FaPlus style={{ fontSize: '1rem', color: 'var(--primary)' }} />
                            {activeTab === 'dept' ? 'Assign Faculty to Department' : 'Assign Warden to Hostel & Floor'}
                        </h3>
                        {activeTab === 'dept' ? (
                            <>
                                <form onSubmit={handleAddDepartment} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Add New Department</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Department (e.g. CSE)" 
                                            value={newDeptName}
                                            onChange={(e) => setNewDeptName(e.target.value)}
                                            style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                        />
                                        <button type="submit" className="add-btn" style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                                            Add
                                        </button>
                                    </div>
                                </form>
                                <form onSubmit={handleAddDeptMapping}>
                                    <div className="form-group">
                                        <label>Select Department</label>
                                        <select
                                            value={deptForm.department}
                                            onChange={(e) => setDeptForm({ ...deptForm, department: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Department...</option>
                                            {availableDepts.length > 0 ? availableDepts.map((dept, index) => (
                                                <option key={index} value={dept}>{dept}</option>
                                            )) : (
                                                <option value="" disabled>No departments found</option>
                                            )}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Select Faculty</label>
                                        <select
                                            value={deptForm.faculty_id}
                                            onChange={(e) => setDeptForm({ ...deptForm, faculty_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Faculty...</option>
                                            {faculty.map(f => (
                                                <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="submit-rule-btn">
                                        Save Mapping
                                    </button>
                                </form>
                            </>
                        ) : (
                            <form onSubmit={handleAddWardenMapping}>
                                <div className="form-group">
                                    <label>Select Hostel</label>
                                    <select
                                        value={hostelForm.hostel_name}
                                        onChange={(e) => setHostelForm({ ...hostelForm, hostel_name: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Hostel...</option>
                                        {availableHostels.length > 0 ? availableHostels.map((hostel, index) => (
                                            <option key={index} value={hostel}>{hostel}</option>
                                        )) : (
                                            <option value="" disabled>No hostels found from students</option>
                                        )}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Select Floor</label>
                                    <select
                                        value={hostelForm.floor}
                                        onChange={(e) => setHostelForm({ ...hostelForm, floor: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Floor...</option>
                                        <option value="First Floor">First Floor</option>
                                        <option value="Second Floor">Second Floor</option>
                                        <option value="Third Floor">Third Floor</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Select Faculty</label>
                                    <select
                                        value={hostelForm.faculty_id}
                                        onChange={(e) => setHostelForm({ ...hostelForm, faculty_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Faculty...</option>
                                        {faculty.map(f => (
                                            <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="submit-rule-btn">
                                    Save Rule
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Table Section */}
                    <div className="rule-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '25px', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ margin: 0 }}>
                                <FaSitemap style={{ color: 'var(--primary)' }} />
                                Existing Rules
                            </h3>
                        </div>

                        <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
                            <table className="rules-table">
                                <thead>
                                    <tr>
                                        <th>{activeTab === 'dept' ? 'Department' : 'Hostel & Floor'}</th>
                                        <th>Assigned Faculty</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeTab === 'dept' ? (
                                        deptMentors.length > 0 ? deptMentors.map(m => (
                                            <tr key={m._id}>
                                                <td>{m.department}</td>
                                                <td>
                                                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <FaUserTie style={{ color: 'var(--primary)', fontSize: '0.8rem' }} />
                                                        {m.faculty?.name || 'Unknown'}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '20px' }}>{m.faculty?.email}</div>
                                                </td>
                                                <td>
                                                    <button onClick={() => handleDelete('dept', m._id)} className="delete-rule-btn">
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No department mappings found.</td>
                                            </tr>
                                        )
                                    ) : (
                                        hostelWardens.length > 0 ? hostelWardens.map(w => (
                                            <tr key={w._id}>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{w.hostel_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.floor}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <FaUserTie style={{ color: 'var(--primary)', fontSize: '0.8rem' }} />
                                                        {w.faculty?.name || 'Unknown'}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '20px' }}>{w.faculty?.email}</div>
                                                </td>
                                                <td>
                                                    <button onClick={() => handleDelete('warden', w._id)} className="delete-rule-btn">
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No warden mappings found.</td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminMappings;
