'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { GlassCard } from '@/components/effects/GlassCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Navigation, ListFilter, ChevronLeft, ChevronRight, Stethoscope, X, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination";
import SearchComponent from '@/components/ui/animated-glowing-search-bar';
import { useSearchParams } from 'next/navigation';

const AdvancedMap = dynamic(() => import('@/components/ui/interactive-map').then(mod => mod.AdvancedMap), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-muted/20 animate-pulse rounded-3xl border border-white/10" />
});

// Hospital type options
const HOSPITAL_TYPES = [
    { id: 'government', label: 'Government / Trust', value: 'government' },
    { id: 'private', label: 'Private (For Profit)', value: 'Private(For Profit)' },
    { id: 'private-np', label: 'Private (Non Profit)', value: 'Private(Not For Profit)' },
    { id: 'trust', label: 'Trust', value: 'Trust' },
];

// ── Inner page (needs useSearchParams) ─────────────────────────────────────
function HospitalsPageInner() {
    const searchParams = useSearchParams();

    // ── State ──────────────────────────────────────────────────────────────
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string[]>([]);
    const [filterSpecialty, setFilterSpecialty] = useState<string[]>([]);

    // DB-sourced specialties
    const [allSpecialties, setAllSpecialties] = useState<{ name: string; count: number }[]>([]);
    const [specialtySearch, setSpecialtySearch] = useState('');
    const [specialtiesLoading, setSpecialtiesLoading] = useState(true);
    const [specialtySummary, setSpecialtySummary] = useState<string | null>(null);

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationGranted, setLocationGranted] = useState(false);
    const [focusedLocation, setFocusedLocation] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalHospitals, setTotalHospitals] = useState(0);
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilterTab, setActiveFilterTab] = useState<'specialty' | 'type'>('specialty');

    // Track if we've started fetching (avoids double-fetch on mount)
    const fetchedRef = useRef(false);
    // Keep a ref to userLocation so effects don't capture stale closure
    const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);

    // ── Read URL param on mount ─────────────────────────────────────────────
    useEffect(() => {
        const raw = searchParams.get('specialty');
        if (raw) {
            setFilterSpecialty(raw.split(',').map(s => s.trim()).filter(Boolean));
        }
    }, []);

    // ── Fetch specialties from DB ───────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/hospitals/specialties');
                const data = await res.json();
                if (data.specialties) setAllSpecialties(data.specialties);
            } catch (e) {
                console.error('Failed to load specialties', e);
            } finally {
                setSpecialtiesLoading(false);
            }
        };
        load();
    }, []);

    // ── Sync userLocation into ref ───────────────────────────────────────────
    useEffect(() => {
        userLocationRef.current = userLocation;
    }, [userLocation]);

    // ── Geolocation ─────────────────────────────────────────────────────────
    const requestLocation = () => {
        if (!navigator.geolocation) {
            if (!fetchedRef.current) { fetchedRef.current = true; fetchHospitals(null, 0); }
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                setLocationGranted(true);
            },
            () => {
                setLocationGranted(false);
                if (!fetchedRef.current) { fetchedRef.current = true; fetchHospitals(null, 0); }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    };

    useEffect(() => {
        requestLocation();
    }, []);

    // ── Fetch when location resolves ────────────────────────────────────────
    useEffect(() => {
        if (userLocation !== null) {
            fetchedRef.current = true;
            fetchHospitals(userLocation, 0);
            setPage(0);
        }
    }, [userLocation]);

    // ── Debounced re-fetch on filter changes ────────────────────────────────
    useEffect(() => {
        if (!fetchedRef.current) return; // wait for geolocation first attempt
        const timer = setTimeout(() => {
            fetchHospitals(userLocationRef.current, 0);
            setPage(0);
        }, 400);

        if (filterSpecialty.length === 1 && filterSpecialty[0]) {
            fetch(`/api/medlineplus?specialty=${encodeURIComponent(filterSpecialty[0])}`)
                .then(r => r.json())
                .then(d => setSpecialtySummary(d.summary))
                .catch(() => setSpecialtySummary(null));
        } else {
            setSpecialtySummary(null);
        }

        return () => clearTimeout(timer);
    }, [searchTerm, filterType, filterSpecialty]);

    // ── Re-fetch on page change ─────────────────────────────────────────────
    useEffect(() => {
        if (fetchedRef.current) fetchHospitals(userLocation, page);
    }, [page]);

    // ── Core fetch ─────────────────────────────────────────────────────────
    const fetchHospitals = async (location: { lat: number; lng: number } | null, pageNum: number) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', pageNum.toString());
            params.append('limit', '25');

            if (location) {
                params.append('lat', location.lat.toString());
                params.append('lng', location.lng.toString());
                // No radius — API now sorts by nearest, shows all
            }
            if (searchTerm.trim()) params.append('search', searchTerm.trim());
            if (filterType.length > 0) params.append('type', filterType.join(','));
            if (filterSpecialty.length > 0) params.append('specialty', filterSpecialty.join(','));

            const res = await fetch(`/api/hospitals?${params.toString()}`);
            const data = await res.json();

            const hospList: any = data.hospitals || [];
            hospList.mapMarkers = data.mapMarkers;
            setHospitals(hospList);
            setTotalPages(data.totalPages || 0);
            setTotalHospitals(data.total || 0);
        } catch (err) {
            console.error('Failed to fetch hospitals:', err);
        } finally {
            setLoading(false);
        }
    };

    // ── Helpers ────────────────────────────────────────────────────────────
    const handlePageChange = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getDirections = (hospital: any) => {
        if (!hospital?.coordinates?.lat) return;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`, '_blank');
    };

    const toggleSpecialty = (name: string) => {
        setFilterSpecialty(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
    };

    const toggleType = (value: string, checked: boolean) => {
        setFilterType(prev => checked ? [...prev, value] : prev.filter(t => t !== value));
    };

    const clearAllFilters = () => { setFilterType([]); setFilterSpecialty([]); setPage(0); };

    const hasActiveFilters = filterType.length > 0 || filterSpecialty.length > 0;

    // Specialty search filter
    const visibleSpecialties = allSpecialties.filter(s =>
        s.name.toLowerCase().includes(specialtySearch.toLowerCase())
    );

    // Map markers
    const sourceHospitals = (hospitals as any).mapMarkers || hospitals;
    const markers = sourceHospitals
        .filter((h: any) => h.position || (h.coordinates?.lat && h.coordinates?.lng))
        .map((h: any) => ({
            id: h.id || h._id,
            position: h.position || [h.coordinates.lat, h.coordinates.lng],
            color: 'red',
            popup: { title: h.name, content: `${h.address || ''}, ${h.city || ''}`, image: '/photo/logo.png' }
        }));

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 space-y-8">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-gradient mb-2">Hospitals</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-muted-foreground flex items-center gap-2">
                            {totalHospitals > 0
                                ? <>{totalHospitals} facilities found{locationGranted && <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">📍 Nearest first</span>}</>
                                : 'Locate top-rated healthcare facilities near you'}
                            {filterSpecialty.length > 0 && (
                                <span className="text-xs text-medical-blue">· {filterSpecialty.slice(0, 2).join(', ')}{filterSpecialty.length > 2 ? ` +${filterSpecialty.length - 2}` : ''}</span>
                            )}
                        </p>
                        {!locationGranted && (
                            <button
                                onClick={requestLocation}
                                className="text-xs px-3 py-1 rounded-full border border-medical-blue/40 text-medical-blue hover:bg-medical-blue/10 transition-colors flex items-center gap-1.5"
                            >
                                <MapPin className="w-3 h-3" /> Use My Location
                            </button>
                        )}
                    </div>
                </div>

                {/* Search & Filter row */}
                <div className="mb-4 w-full">
                    <SearchComponent
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search hospitals by name, city or specialty..."
                        className="w-full"
                        filterSlot={
                            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-lg hover:bg-white/10 relative">
                                        <ListFilter className="h-5 w-5 text-white/70" />
                                        {hasActiveFilters && (
                                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-blue opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-blue" />
                                            </span>
                                        )}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent align="end" sideOffset={8}
                                    className="w-80 p-0 bg-[#0d1117]/95 backdrop-blur-2xl border border-white/10 text-white shadow-2xl rounded-2xl overflow-hidden">

                                    {/* Header */}
                                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                                        <span className="font-semibold text-sm flex items-center gap-2">
                                            <ListFilter className="w-4 h-4 text-medical-blue" />
                                            Filter Hospitals
                                        </span>
                                        {hasActiveFilters && (
                                            <button onClick={clearAllFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                                <X className="w-3 h-3" /> Clear all
                                            </button>
                                        )}
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex border-b border-white/10">
                                        {(['specialty', 'type'] as const).map(tab => (
                                            <button key={tab} onClick={() => setActiveFilterTab(tab)}
                                                className={cn('flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5',
                                                    activeFilterTab === tab
                                                        ? 'text-medical-blue border-b-2 border-medical-blue bg-medical-blue/5'
                                                        : 'text-white/50 hover:text-white/80'
                                                )}>
                                                {tab === 'specialty' ? <Stethoscope className="w-3.5 h-3.5" /> : '🏥'}
                                                {tab === 'specialty' ? 'Specialty' : 'Type'}
                                                {tab === 'specialty' && filterSpecialty.length > 0 && (
                                                    <span className="bg-medical-blue text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{filterSpecialty.length}</span>
                                                )}
                                                {tab === 'type' && filterType.length > 0 && (
                                                    <span className="bg-medical-blue text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{filterType.length}</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Specialty panel */}
                                    {activeFilterTab === 'specialty' && (
                                        <>
                                            {/* Specialty search */}
                                            <div className="px-3 pt-3 pb-2">
                                                <div className="relative">
                                                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-white/40" />
                                                    <input
                                                        value={specialtySearch}
                                                        onChange={e => setSpecialtySearch(e.target.value)}
                                                        placeholder="Search specialties..."
                                                        className="w-full pl-7 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-medical-blue/50 transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            {/* Specialty list */}
                                            <div className="px-3 pb-3 max-h-56 overflow-y-auto custom-scrollbar">
                                                {specialtiesLoading ? (
                                                    <div className="space-y-1.5 py-2">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <div key={i} className="h-7 bg-white/5 rounded-lg animate-pulse" />
                                                        ))}
                                                    </div>
                                                ) : visibleSpecialties.length === 0 ? (
                                                    <p className="text-center text-xs text-white/30 py-4">No specialties found</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {visibleSpecialties.map(spec => {
                                                            const active = filterSpecialty.includes(spec.name);
                                                            return (
                                                                <button key={spec.name} onClick={() => toggleSpecialty(spec.name)}
                                                                    className={cn(
                                                                        'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border whitespace-nowrap',
                                                                        active
                                                                            ? 'bg-medical-blue text-white border-medical-blue shadow-[0_0_10px_rgba(59,130,246,0.35)]'
                                                                            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                                                                    )}>
                                                                    {spec.name}
                                                                    <span className={cn('ml-1 text-[9px]', active ? 'text-white/70' : 'text-white/30')}>
                                                                        {spec.count}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Type panel */}
                                    {activeFilterTab === 'type' && (
                                        <div className="p-3 space-y-1">
                                            {HOSPITAL_TYPES.map(type => (
                                                <div key={type.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                                    <Checkbox
                                                        id={type.id}
                                                        checked={filterType.includes(type.value)}
                                                        onCheckedChange={(checked: boolean) => toggleType(type.value, checked)}
                                                        className="border-white/40 data-[state=checked]:bg-medical-blue data-[state=checked]:border-medical-blue"
                                                    />
                                                    <Label htmlFor={type.id} className="text-sm text-white/90 cursor-pointer">{type.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Close button */}
                                    <div className="px-4 py-2.5 border-t border-white/10 text-center">
                                        <button onClick={() => setFilterOpen(false)} className="text-xs text-white/40 hover:text-white transition-colors">
                                            Done
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        }
                    />
                </div>

                {/* Active specialty pills */}
                {filterSpecialty.length > 0 && (
                    <div className="flex flex-col gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-wrap gap-2">
                            {filterSpecialty.map(name => (
                                <span key={name} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-medical-blue/15 border border-medical-blue/30 text-medical-blue">
                                    {name}
                                    <button onClick={() => toggleSpecialty(name)} className="hover:text-white transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <button onClick={() => setFilterSpecialty([])} className="text-xs text-white/40 hover:text-white/70 px-1">
                                Clear
                            </button>
                        </div>
                        {specialtySummary && filterSpecialty.length === 1 && (
                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-100 max-w-3xl">
                                <strong className="text-white block mb-1.5 tracking-wide">ℹ️ About {filterSpecialty[0]}</strong>
                                <p className="leading-relaxed opacity-90">{specialtySummary.replace(/<[^>]*>?/gm, '')}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Hospital cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <GlassCard key={i} hover={false}>
                                <div className="animate-pulse space-y-3">
                                    <div className="h-6 bg-white/10 rounded w-3/4" />
                                    <div className="h-4 bg-white/10 rounded w-full" />
                                    <div className="h-4 bg-white/10 rounded w-2/3" />
                                    <div className="flex gap-2 mt-4">
                                        <div className="h-8 bg-white/10 rounded flex-1" />
                                        <div className="h-8 bg-white/10 rounded flex-1" />
                                        <div className="h-8 bg-white/10 rounded flex-1" />
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                ) : hospitals.length === 0 ? (
                    <GlassCard hover={false} className="mb-8">
                        <div className="text-center py-12">
                            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium mb-1">No hospitals found</p>
                            {filterSpecialty.length > 0 && (
                                <p className="text-sm text-muted-foreground/60 mt-2">
                                    No hospitals with <strong>{filterSpecialty.join(', ')}</strong> specialty.{' '}
                                    <button onClick={() => setFilterSpecialty([])} className="text-medical-blue hover:underline">Clear filter</button>
                                </p>
                            )}
                        </div>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {hospitals.map((hospital: any, index: number) => (
                            <GlassCard key={hospital._id || index}>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="text-lg font-semibold truncate flex-1" title={hospital.name}>{hospital.name}</h3>
                                            {/* Distance badge */}
                                            {locationGranted && typeof hospital.distance === 'number' && (
                                                <span className={cn(
                                                    'text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 font-medium',
                                                    hospital.distance < 10
                                                        ? 'bg-green-500/15 text-green-400 border-green-500/30'
                                                        : hospital.distance < 50
                                                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                                            : 'bg-white/10 text-white/50 border-white/10'
                                                )}>
                                                    {hospital.distance < 1
                                                        ? `< 1 km`
                                                        : `${Math.round(hospital.distance)} km`}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground flex items-start gap-2 h-10 overflow-hidden">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-medical-blue" />
                                            <span>{hospital.address}, {hospital.city}</span>
                                        </p>
                                    </div>

                                    {hospital.specialty?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 max-h-14 overflow-hidden content-start">
                                            {hospital.specialty.slice(0, 3).map((spec: string, i: number) => {
                                                const matched = filterSpecialty.some(f =>
                                                    spec.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(spec.toLowerCase())
                                                );
                                                return (
                                                    <span key={i} className={cn(
                                                        'text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                                                        matched
                                                            ? 'bg-medical-blue/20 text-medical-blue border-medical-blue/40 font-semibold'
                                                            : 'bg-white/5 text-white/50 border-white/10'
                                                    )}>
                                                        {spec}
                                                    </span>
                                                );
                                            })}
                                            {hospital.specialty.length > 3 && (
                                                <span className="text-[10px] px-2 py-0.5 text-muted-foreground">+{hospital.specialty.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-1">
                                        <Button size="sm" className="flex-1 bg-gradient-to-r from-medical-blue to-medical-purple hover:opacity-90" onClick={() => getDirections(hospital)}>
                                            <Navigation className="w-4 h-4 mr-1.5" /> Directions
                                        </Button>
                                        <Button size="sm" className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20" onClick={() => {
                                            if (hospital.coordinates?.lat) {
                                                setFocusedLocation({ lat: hospital.coordinates.lat, lng: hospital.coordinates.lng, zoom: 16 });
                                                document.getElementById('hospital-map')?.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}>
                                            <MapPin className="w-4 h-4 mr-1.5" /> Map
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => window.open(`tel:${hospital.phone}`, '_self')} className="flex-1 border-white/10 hover:bg-white/5">
                                            <Phone className="w-4 h-4 mr-1.5" /> Call
                                        </Button>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 mb-12">
                        <Pagination>
                            <PaginationContent className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 shadow-2xl border-none">
                                <PaginationItem>
                                    <Button variant="ghost" size="icon" onClick={() => handlePageChange(Math.max(0, page - 1))} disabled={page === 0} className="text-white hover:bg-white/20 rounded-full">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </PaginationItem>
                                {(() => {
                                    const pages = [];
                                    const maxV = 5;
                                    let start = Math.max(0, page - Math.floor(maxV / 2));
                                    let end = Math.min(totalPages - 1, start + maxV - 1);
                                    if (end - start + 1 < maxV) start = Math.max(0, end - maxV + 1);
                                    if (start > 0) pages.push(<PaginationItem key="s"><PaginationEllipsis className="text-white/50" /></PaginationItem>);
                                    for (let i = start; i <= end; i++) {
                                        pages.push(
                                            <PaginationItem key={i}>
                                                <Button variant={i === page ? "default" : "ghost"} size="icon" onClick={() => handlePageChange(i)}
                                                    className={cn("rounded-full w-9 h-9", i === page ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-110" : "text-white/70 hover:bg-white/10")}>
                                                    {i + 1}
                                                </Button>
                                            </PaginationItem>
                                        );
                                    }
                                    if (end < totalPages - 1) pages.push(<PaginationItem key="e"><PaginationEllipsis className="text-white/50" /></PaginationItem>);
                                    return pages;
                                })()}
                                <PaginationItem>
                                    <Button variant="ghost" size="icon" onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1} className="text-white hover:bg-white/20 rounded-full">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                {/* Map */}
                <div id="hospital-map" className="rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    <AdvancedMap
                        center={userLocation ? [userLocation.lat, userLocation.lng] : [23.0225, 72.5714]}
                        zoom={12}
                        markers={markers}
                        enableSearch={true}
                        flyToLocation={focusedLocation}
                        onSearch={(result) => {
                            if (result?.latLng) {
                                setUserLocation({ lat: result.latLng[0], lng: result.latLng[1] });
                                setFocusedLocation({ lat: result.latLng[0], lng: result.latLng[1], zoom: 14 });
                            }
                        }}
                        style={{ height: '500px', width: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function HospitalsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
            <HospitalsPageInner />
        </Suspense>
    );
}
