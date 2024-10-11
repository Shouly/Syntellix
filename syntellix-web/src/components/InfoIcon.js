import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

function InfoIcon({ tooltip }) {
    return (
        <div className="group relative inline-block ml-2">
            <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="opacity-0 bg-black text-white text-xs rounded py-1 px-2 absolute z-[10002] bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 group-hover:opacity-100 transition-opacity duration-300 w-48 text-center pointer-events-none">
                {tooltip}
                <svg className="absolute text-black h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                </svg>
            </div>
        </div>
    );
}

export default InfoIcon;