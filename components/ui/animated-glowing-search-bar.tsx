import React from 'react';

interface SearchComponentProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    placeholder?: string;
    filterSlot?: React.ReactNode;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ value, onChange, className, placeholder, filterSlot }) => {
    return (
        <div className={`relative flex items-center justify-center w-full ${className || ''}`}>
            <div id="poda" className="relative flex items-center justify-center group h-[60px] w-full max-w-4xl">
                {/* Glow Effects - Adjusted for responsiveness and tranaparency */}
                <div className="absolute z-[-1] overflow-hidden h-full w-full rounded-xl blur-[3px] opacity-50
                        before:absolute before:content-[''] before:z-[-2] before:w-[200%] before:h-[200%] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-60
                        before:bg-[conic-gradient(#000,#402fb5_5%,#000_38%,#000_50%,#cf30aa_60%,#000_87%)] before:transition-all before:duration-2000
                        group-hover:before:rotate-[-120deg] group-focus-within:before:rotate-[420deg] group-focus-within:before:duration-[4000ms]">
                </div>

                {/* Additional glow layers for richness */}
                <div className="absolute z-[-1] overflow-hidden h-full w-full rounded-xl blur-[3px] opacity-40">
                    <div className="absolute inset-0 bg-gradient-to-r from-medical-blue/20 to-medical-purple/20 animate-pulse"></div>
                </div>

                <div id="main" className="relative group w-full h-full flex items-center">
                    <input
                        placeholder={placeholder || "Search..."}
                        type="text"
                        name="text"
                        value={value}
                        onChange={onChange}
                        className="bg-white/5 backdrop-blur-md border border-white/10 w-full h-[56px] rounded-xl text-white pl-[59px] pr-[60px] text-lg focus:outline-none focus:bg-white/10 placeholder-white/40 transition-all font-light"
                    />

                    {/* Animated side masks/accents */}
                    <div id="pink-mask" className="pointer-events-none w-[30px] h-[20px] absolute bg-[#cf30aa] top-[18px] left-[10px] blur-xl opacity-60 transition-all duration-2000 group-hover:opacity-100"></div>

                    {/* Spinning accent */}
                    {/* <div className="absolute h-[42px] w-[40px] overflow-hidden top-[9px] right-[9px] rounded-lg
                          before:absolute before:content-[''] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-90
                          before:bg-[conic-gradient(rgba(0,0,0,0),#3d3a4f,rgba(0,0,0,0)_50%,rgba(0,0,0,0)_50%,#3d3a4f,rgba(0,0,0,0)_100%)]
                          before:brightness-135 before:animate-spin-slow pointer-events-none opacity-50">
                    </div> */}

                    {/* Filter Slot / Icon */}
                    <div className="absolute top-0 right-0 h-full flex items-center pr-2">
                        {filterSlot ? (
                            <div className="relative z-10">
                                {filterSlot}
                            </div>
                        ) : (
                            <div id="filter-icon" className="flex items-center justify-center max-h-10 max-w-[38px] h-10 w-10 overflow-hidden rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                <svg preserveAspectRatio="none" height="20" width="20" viewBox="4.8 4.56 14.832 15.408" fill="none">
                                    <path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z" stroke="#d6d6e6" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </div>
                        )}
                    </div>

                    <div id="search-icon" className="absolute left-5 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" height="24" fill="none" className="feather feather-search opacity-80">
                            <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
                            <line stroke="url(#searchl)" y2="16.65" y1="22" x2="16.65" x1="22"></line>
                            <defs>
                                <linearGradient gradientTransform="rotate(50)" id="search">
                                    <stop stopColor="#f8e7f8" offset="0%"></stop>
                                    <stop stopColor="#b6a9b7" offset="50%"></stop>
                                </linearGradient>
                                <linearGradient id="searchl">
                                    <stop stopColor="#b6a9b7" offset="0%"></stop>
                                    <stop stopColor="#837484" offset="50%"></stop>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchComponent;
