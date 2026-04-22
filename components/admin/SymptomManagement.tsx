'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Trash2, Edit2, Download, Upload, Sparkles, Loader2, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Symptom {
    _id?: string;
    name: string;
    category: string;
    icon?: string;
    description?: string;
    commonDiseases?: string[];
}

export default function SymptomManagement() {
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentSymptom, setCurrentSymptom] = useState<Symptom | null>(null);
    const [formData, setFormData] = useState<Symptom>({
        name: '',
        category: 'General',
        icon: 'Activity',
        description: '',
        commonDiseases: [],
    });

    useEffect(() => {
        fetchSymptoms();
    }, []);

    const fetchSymptoms = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/symptoms');
            const data = await res.json();
            setSymptoms(data.symptoms || []);
        } catch (error) {
            console.error('Error fetching symptoms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (symptom: Symptom | null = null) => {
        if (symptom) {
            setCurrentSymptom(symptom);
            setFormData(symptom);
        } else {
            setCurrentSymptom(null);
            setFormData({
                name: '',
                category: 'General',
                icon: 'Activity',
                description: '',
                commonDiseases: [],
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const method = currentSymptom?._id ? 'PATCH' : 'POST';
            const url = currentSymptom?._id 
                ? `/api/admin/symptoms/${currentSymptom._id}` 
                : '/api/admin/symptoms';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchSymptoms();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save symptom');
            }
        } catch (error) {
            console.error('Error saving symptom:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this symptom?')) return;

        try {
            const res = await fetch(`/api/admin/symptoms/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchSymptoms();
            }
        } catch (error) {
            console.error('Error deleting symptom:', error);
        }
    };

    const handleGenerateContent = async () => {
        if (!formData.name) return;

        setIsGenerating(true);
        try {
            const res = await fetch('/api/admin/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type: 'symptom_description', 
                    name: formData.name,
                }),
            });
            if (res.ok) {
                const { result } = await res.json();
                setFormData(prev => ({ ...prev, description: result }));
            }
        } catch (error) {
            console.error('AI Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(symptoms));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "symptoms_export.json");
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
                    alert('Invalid format: Expected an array of symptoms');
                    return;
                }

                if (!confirm(`Import ${data.length} symptoms? This will add them to the database.`)) return;

                let successCount = 0;
                for (const item of data) {
                    const { _id, ...rest } = item;
                    const res = await fetch('/api/admin/symptoms', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(rest),
                    });
                    if (res.ok) successCount++;
                }

                alert(`Successfully imported ${successCount} out of ${data.length} symptoms.`);
                fetchSymptoms();
            } catch (err) {
                console.error('Import failed:', err);
                alert('Import failed: Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    const filteredSymptoms = symptoms.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/30 p-4 rounded-2xl border border-white/10">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search symptoms by name or category..." 
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
                            id="import-symptoms"
                        />
                        <Button variant="glass" size="sm" onClick={() => document.getElementById('import-symptoms')?.click()}>
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
                        Add Symptom
                    </Button>
                </div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden text-left">
                <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-bold">Symptoms ({filteredSymptoms.length})</h3>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-medical-blue" />}
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-gray-400 sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Symptom Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSymptoms.map((s) => (
                                <tr key={s._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">
                                            {s.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 max-w-md truncate">{s.description || 'No description provided'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(s)}
                                                className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => s._id && handleDelete(s._id)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSymptoms.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No symptoms found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-xl bg-[#0f0f0f] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>{currentSymptom ? 'Edit Symptom' : 'Add New Symptom'}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="s-name">Symptom Name</Label>
                            <Input 
                                id="s-name" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="s-category">Category</Label>
                            <Input 
                                id="s-category" 
                                value={formData.category} 
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Description</Label>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleGenerateContent}
                                    disabled={isGenerating || !formData.name}
                                    className="text-medical-blue hover:text-medical-blue hover:bg-medical-blue/10 h-7"
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                    AI Generate
                                </Button>
                            </div>
                            <Textarea 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="bg-white/5 border-white/10 min-h-[100px]"
                                placeholder="Describe the symptom..."
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="s-diseases">Commonly Associated Diseases (comma separated)</Label>
                            <Input 
                                id="s-diseases" 
                                value={formData.commonDiseases?.join(', ')} 
                                onChange={(e) => setFormData({...formData, commonDiseases: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                                className="bg-white/5 border-white/10"
                                placeholder="Flu, Malaria, etc."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="medical" onClick={handleSave}>Save Symptom</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
