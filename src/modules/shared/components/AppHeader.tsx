const AppHeader = () => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <div className="size-6 text-primary!">
          <svg
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">
          Internship Manager
        </h2>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <label className="relative flex flex-col min-w-40 h-10! max-w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            search
          </span>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border-slate-200 bg-slate-100 focus:border-primary h-full placeholder:text-slate-500 pl-10 pr-4 text-sm font-normal leading-normal"
            placeholder="Tìm kiếm ..."
          />
        </label>

        <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
          <span className="material-symbols-outlined">settings</span>
        </button>

        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          data-alt="User avatar for Dr. Eleanor Vance"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBd7SMerdlIkXHG8hslnCQlEGKs2aF6PVHctr1GlOIYkAG9xnOV_xR_nRL1ctla-F0BoIG497-t8OCk6m11Lz8hH_oKoKGVQQ9qT0Cay93NL6c3sjdQ_YaZwsRBgU_7CbzhuXjSMkPBaFsy32Utbk8qygFNfGud-R-EbylQATUz128eQ_ReiCb8OA0wD_1OXtFIHgf4nmkLpWJoDPQveFa_Gr988WS1uMML45p5YHURPibZ1LM6TkdWp1SmhL1wzCX-JIPSIST_Ck0")',
          }}
        />
      </div>
    </div>
  );
};

export default AppHeader;
