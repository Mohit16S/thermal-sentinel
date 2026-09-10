import * as React from 'react';import {clsx} from 'clsx';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{variant?:'default'|'outline'}
export function Button({className,variant='default',...props}:ButtonProps){return <button className={clsx('rounded-md px-3 py-2 text-xs font-semibold transition-colors',variant==='default'?'bg-[#44d3c5] text-[#061214] hover:bg-[#67e8dc]':'border border-[#294149] bg-[#0b171b] hover:bg-[#102328]',className)} {...props}/>}
