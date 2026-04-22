'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Trash2, Edit2, Download, Upload, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Disease {
    _id?: string;
    name: string;
    type: string;
    category: string;
    commonSymptoms: string[]; // Symptom IDs or Names
    treatmentInfo: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    specialist: string;
    confidence: number;
    description?: string;
}

interface Symptom {
    _id: string;
    name: string;
}

export default function DiseaseManagement() {
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentDisease, setCurrentDisease] = useState<Disease | null>(null);
    const [formData, setFormData] = useState<Disease>({
        name: '',
        type: 'Infectious',
        category: 'General',
        commonSymptoms: [],
        treatmentInfo: '',
        severity: 'medium',
        specialist: 'General Physician',
        confidence: 75,
    });

    useEffect(() => {
        fetchDiseases();
        fetchSymptoms();
    }, []);

    const fetchDiseases = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/diseases');
            const data = await res.json();
            setDiseases(data.diseases || []);
        } catch (error) {
            console.error('Error fetching diseases:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSymptoms = async () => {
        try {
            const res = await fetch('/api/admin/symptoms');
            const data = await res.json();
            setSymptoms(data.symptoms || []);
        } catch (error) {
            console.error('Error fetching symptoms:', error);
        }
    };

    const handleOpenModal = (disease: Disease | null = null) => {
        if (disease) {
            setCurrentDisease(disease);
            setFormData(disease);
        } else {
            setCurrentDisease(null);
            setFormData({
                name: '',
                type: 'Infectious',
                category: 'General',
                commonSymptoms: [],
                treatmentInfo: '',
                severity: 'medium',
                specialist: 'General Physician',
                confidence: 75,
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const method = currentDisease?._id ? 'PATCH' : 'POST';
            const url = currentDisease?._id 
                ? `/api/admin/diseases/${currentDisease._id}` 
                : '/api/admin/diseases';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchDiseases();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save disease');
            }
        } catch (error) {
            console.error('Error saving disease:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this disease?')) return;

        try {
            const res = await fetch(`/api/admin/diseases/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchDiseases();
            }
        } catch (error) {
            console.error('Error deleting disease:', error);
        }
    };

    const handleGenerateContent = async (field: 'description' | 'treatment_info') => {
        if (!formData.name) return;

        setIsGenerating(true);
        try {
            const res = await fetch('/api/admin/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type: field, 
                    name: formData.name,
                    extra: formData.type
                }),
            });
            if (res.ok) {
                const { result } = await res.json();
                setFormData(prev => ({ ...prev, [field === 'description' ? 'description' : 'treatmentInfo']: result }));
            }
        } catch (error) {
            console.error('AI Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(diseases));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "diseases_export.json");
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
                    alert('Invalid format: Expected an array of diseases');
                    return;
                }

                if (!confirm(`Import ${data.length} diseases? This will add them to the database.`)) return;

                let successCount = 0;
                for (const item of data) {
                    const { _id, ...rest } = item;
                    const res = await fetch('/api/admin/diseases', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(rest),
                    });
                    if (res.ok) successCount++;
                }

                alert(`Successfully imported ${successCount} out of ${data.length} diseases.`);
                fetchDiseases();
            } catch (err) {
                console.error('Import failed:', err);
                alert('Import failed: Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    const filteredDiseases = diseases.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/30 p-4 rounded-2xl border border-white/10">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search diseases by name, type or specialist..." 
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
                            id="import-diseases"
                        />
                        <Button variant="glass" size="sm" onClick={() => document.getElementById('import-diseases')?.click()}>
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
                        Add Disease
                    </Button>
                </div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden text-left">
                <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-bold">Diseases ({filteredDiseases.length})</h3>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-medical-blue" />}
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-gray-400 sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Disease Name</th>
                                <th className="px-6 py-4">Type / Category</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Specialist</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredDiseases.map((d) => (
                                <tr key={d._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-white">{d.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-300">{d.type}</div>
                                        <div className="text-xs text-gray-500">{d.category}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                                            d.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                            d.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                            d.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}>
                                            {d.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 font-medium">{d.specialist}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(d)}
                                                className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => d._id && handleDelete(d._id)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredDiseases.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No diseases found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl bg-[#0f0f0f] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentDisease ? 'Edit Disease' : 'Add New Disease'}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="d-name">Disease Name</Label>
                            <Input 
                                id="d-name" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="d-type">Type</Label>
                            <Input 
                                id="d-type" 
                                value={formData.type} 
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="d-category">Category</Label>
                            <Input 
                                id="d-category" 
                                value={formData.category} 
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="d-severity">Severity</Label>
                            <Select 
                                value={formData.severity} 
                                onValueChange={(v: any) => setFormData({...formData, severity: v})}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="d-specialist">Specialist</Label>
                            <Input 
                                id="d-specialist" 
                                value={formData.specialist} 
                                onChange={(e) => setFormData({...formData, specialist: e.target.value})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="d-confidence">Confidence Score (0-100)</Label>
                            <Input 
                                id="d-confidence" 
                                type="number"
                                value={formData.confidence} 
                                onChange={(e) => setFormData({...formData, confidence: parseInt(e.target.value)})}
                                className="bg-white/5 border-white/10"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Description</Label>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleGenerateContent('description')}
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
                                placeholder="Describe the disease..."
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Treatment Information</Label>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleGenerateContent('treatment_info')}
                                    disabled={isGenerating || !formData.name}
                                    className="text-medical-blue hover:text-medical-blue hover:bg-medical-blue/10 h-7"
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                    AI Suggest Treatment
                                </Button>
                            </div>
                            <Textarea 
                                value={formData.treatmentInfo} 
                                onChange={(e) => setFormData({...formData, treatmentInfo: e.target.value})}
                                className="bg-white/5 border-white/10 min-h-[100px]"
                                placeholder="Common treatments, medications, etc."
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Common Symptoms</Label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-white/5 rounded-xl border border-white/10">
                                {symptoms.map((s) => (
                                    <button
                                        key={s._id}
                                        type="button"
                                        onClick={() => {
                                            const updated = formData.commonSymptoms.includes(s.name)
                                                ? formData.commonSymptoms.filter(name => name !== s.name)
                                                : [...formData.commonSymptoms, s.name];
                                            setFormData({...formData, commonSymptoms: updated});
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                            formData.commonSymptoms.includes(s.name)
                                                ? 'bg-medical-blue text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="medical" onClick={handleSave}>Save Disease</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
