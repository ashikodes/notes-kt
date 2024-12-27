import settings from '../assets/svg/settings.svg';
import searchIcon from '../assets/svg/search.svg';
import loading from '../assets/svg/loading.svg';
import { Form, useSubmit } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';

interface PageHeaderProps {
    title: string;
    search?: string;
    searching?: boolean;
}

export default function PageHeader({ title, search, searching }: PageHeaderProps) {
    const [searchValue, setSearchValue] = useState(search || '');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const submit = useSubmit();

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const form = document.querySelector('.search-form') as HTMLFormElement;
            if (form) {
                submit(form);
            }
        }, 1000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [searchValue, submit]);

    return (
        <div className="page-header">
            <h2 className="page-header__text">
                {search ? <><span className='side-text'>Showing results for: </span>{searchValue}</> : title}
            </h2>
            <div className="page-header__content">
                <div className="content__search">
                    <Form className='search-form w-full flex' method="get">
                        {!searching && <img src={searchIcon} alt="Search" />}
                        {searching && <img className='loading-icon' src={loading} alt="Loading" />}
                        <input 
                            name="search"
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                            }}
                            disabled={searching}
                            value={searchValue || ''}
                            className="search-input flex-grow" 
                            type="search" 
                            placeholder="Search by title, content, or tags…" 
                        />
                    </Form>
                </div>
                <div className="header-settings">
                    <img src={settings} alt="Settings" />
                </div>
            </div>
        </div>
    );
}