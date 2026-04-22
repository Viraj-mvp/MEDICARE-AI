'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/effects/GlassCard';
import { Search, Plus, MapPin, Phone, Trash2, Edit2, Download, Upload, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Hospital {
    _id?: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    phone: string;
    specialty: string[];
    type?: string;
    rating?: number;
}

export default function HospitalManagement() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [currentHospital, setCurrentHospital] = useState<Hospital | null>(null);
    const [formData, setFormData] = useState<Hospital>({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        coordinates: { lat: 0, lng: 0 },
        phone: '',
        specialty: [],
        type: 'General',
    });

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/hospitals?page=0&limit=100');
            const data = await res.json();
            setHospitals(data.hospitals || []);
        } catch (error) {
            console.error('Error fetching hospitals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (hospital: Hospital | null = null) => {
        if (hospital) {
            setCurrentHospital(hospital);
            setFormData(hospital);
        } else {
            setCurrentHospital(null);
            setFormData({
                name: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                coordinates: { lat: 0, lng: 0 },
                phone: '',
                specialty: [],
                type: 'General',
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const method = currentHospital?._id ? 'PATCH' : 'POST';
            const url = currentHospital?._id 
                ? `/api/admin/hospitals/${currentHospital._id}` 
                : '/api/admin/hospitals';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchHospitals();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save hospital');
            }
        } catch (error) {
            console.error('Error saving hospital:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this hospital?')) return;

        try {
            const res = await fetch(`/api/admin/hospitals/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchHospitals();
            }
        } catch (error) {
            console.error('Error deleting hospital:', error);
        }
    };

    const handleGeocode = async () => {
        const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`;
        if (!fullAddress.trim()) return;

        setIsGeocoding(true);
        try {
            const res = await fetch('/api/admin/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: fullAddress }),
            });
            if (res.ok) {
                const coords = await res.json();
                setFormData(prev => ({ ...prev, coordinates: coords }));
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleGenerateSpecialties = async () => {
        if (!formData.name) return;

        setIsGenerating(true);
        try {
            const res = await fetch('/api/admin/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type: 'hospital_specialties', 
                    name: formData.name,
                    extra: `${formData.city}, ${formData.state}`
                }),
            });
            if (res.ok) {
                const { result } = await res.json();
                setFormData(prev => ({ ...prev, specialty: result }));
            }
        } catch (error) {
            console.error('AI Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hospitals));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "hospitals_export.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (!Array.isArray(data)) {
                    alert('Invalid format: Expected an array of hospitals');
                    return;
                }

                if (!confirm(`Import ${data.length} hospitals? This will add them to the database.`)) return;

                let successCount = 0;
                for (const item of data) {
                    // Remove _id if it exists to avoid conflicts
                    const { _id, ...rest } = item;
                    const res = await fetch('/api/admin/hospitals', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(rest),
                    });
                    if (res.ok) successCount++;
                }

                alert(`Successfully imported ${successCount} out of ${data.length} hospitals.`);
                fetchHospitals();
            } catch (err) {
                console.error('Import failed:', err);
                alert('Import failed: Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    const filteredHospitals = hospitals.filter(h => 
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/30 p-4 rounded-2xl border border-white/10">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search hospitals by name or city..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleImport} 
                            className="hidden" 
                            id="import-hospitals"
                        />
                        <Button variant="glass" size="sm" onClick={() => document.getElementById('import-hospitals')?.click()}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import JSON
                        </Button>
                    </div>
                    <Button variant="glass" size="sm" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export JSON
                    </Button>
                    <Button variant="medical" size="sm" onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Hospital
                    </Button>
                </div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden text-left">
                <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-bold">Hospitals ({filteredHospitals.length})</h3>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-medical-blue" />}
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-gray-400 sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Hospital Info</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Specialties</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredHospitals.map((h) => (
                                <tr key={h._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{h.name}</div>
                                        <div className="text-xs text-blue-400 mt-1">{h.type || 'General Hospital'}</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Phone className="w-3 h-3" /> {h.phone}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-300">{h.city}, {h.state}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {h.coordinates.lat.toFixed(4)}, {h.coordinates.lng.toFixed(4)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {h.specialty.slice(0, 3).map((s, idx) => (
                                                <span key={idx} className="px-2 py-0.5 rounded-full bg-medical-blue/10 text-medical-blue text-[10px]">
                                                    {s}
                                                </span>
                                            ))}
                                            {h.specialty.length > 3 && (
                                                <span className="px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 text-[10px]">
                                                    +{h.specialty.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(h)}
                                                className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => h._id && handleDelete(h._id)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredHospitals.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No hospitals found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl bg-[#0f0f0f] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>{currentHospital ? 'Edit Hospital' : 'Add New Hospital'}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="name">Hospital Name</Label>
                            <Input 
                                id="name" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Hospital Type</Label>
                            <Input 
                                id="type" 
                                value={formData.type} 
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                placeholder="e.g. Government, Private"
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                                id="phone" 
                                value={formData.phone} 
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="address" 
                                    value={formData.address} 
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="bg-white/5 border-white/10 flex-1"
                                />
                                <Button 
                                    variant="outline" 
                                    onClick={handleGeocode} 
                                    disabled={isGeocoding}
                                    className="border-white/10 hover:bg-white/5"
                                >
                                    {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                                    <span className="ml-2">Fetch Coords</span>
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input 
                                id="city" 
                                value={formData.city} 
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input 
                                id="state" 
                                value={formData.state} 
                                onChange={(e) => setFormData({...formData, state: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lat">Latitude</Label>
                            <Input 
                                id="lat" 
                                type="number"
                                value={formData.coordinates.lat} 
                                onChange={(e) => setFormData({...formData, coordinates: {...formData.coordinates, lat: parseFloat(e.target.value)}})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lng">Longitude</Label>
                            <Input 
                                id="lng" 
                                type="number"
                                value={formData.coordinates.lng} 
                                onChange={(e) => setFormData({...formData, coordinates: {...formData.coordinates, lng: parseFloat(e.target.value)}})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Specialties (comma separated)</Label>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleGenerateSpecialties}
                                    disabled={isGenerating || !formData.name}
                                    className="text-medical-blue hover:text-medical-blue hover:bg-medical-blue/10 h-7"
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                    AI Suggest
                                </Button>
                            </div>
                            <Input 
                                value={formData.specialty.join(', ')} 
                                onChange={(e) => setFormData({...formData, specialty: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                                className="bg-white/5 border-white/10"
                                placeholder="Cardiology, Neurology, Pediatrics..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="medical" onClick={handleSave}>Save Hospital</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
