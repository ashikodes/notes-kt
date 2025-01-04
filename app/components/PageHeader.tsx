import settings from "../assets/svg/settings.svg";
import searchIcon from "../assets/svg/search.svg";
import loading from "../assets/svg/loading.svg";
import { Form, useNavigation, useSearchParams } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";

interface PageHeaderProps {
  title: string;
  search?: string;
  url: string;
}

export default function PageHeader({ title, search, url }: PageHeaderProps) {
  const [searchValue, setSearchValue] = useState(search || "");
  const [searchParams, setSearchParams] = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSearch = searchParams.has("search");
  const navigation = useNavigation();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("search");

  const isHome = url === "/notes";
  const isArchivedHome = url === "/notes/archived";

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (searchValue) {
        setSearchParams({ search: searchValue });
      } else if (search && !searchValue) {
        setSearchParams({});
      }
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchValue]);

  useEffect(() => {
    if (!search) {
      setSearchValue("");
    }
  }, [search]);

  return (
    <div className={`page-header ${(isHome || isArchivedHome) ? 'home' : 'other'}`}>
      <h2 className="page-header__text">
        {search && <span className="block lg:hidden">Search</span>}
        <div className="">
          {search ? (
            <div className="hidden lg:block">
              <span className="side-text">Showing results for: </span>
              {searchValue}
            </div>
          ) : (
            title
          )}
        </div>
      </h2>
      <div className="page-header__content">
        <div
          className={`content__search mt-4 lg:mt-0 ${
            hasSearch ? "" : "hidden lg:flex"
          }`}
        >
          <Form className="search-form w-full flex" method="get">
            {!searching && <img src={searchIcon} alt="Search" />}
            {searching && (
              <img className="loading-icon" src={loading} alt="Loading" />
            )}
            <input
              name="search"
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={searching}
              value={searchValue || ""}
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
