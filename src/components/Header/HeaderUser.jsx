import Logo from "./Logo";
import SearchBar from "./SearchBar";
import FilterButton from "./FilterButton";
import LogoutButton from "./LogoutButton";

const HeaderUser = () => {
    const handleLogout = () => {
        localStorage.removeItem("userRole");
        window.location.reload();
    };

    return (
        <header className="flex justify-between items-center bg-[#F9F9F9] px-6 py-3 mx-6 rounded-3xl">
            <Logo />
            <div className="flex items-center space-x-10">
                <SearchBar />
                <FilterButton onClick={() => alert("Открыть фильтр")} />
                <LogoutButton onLogout={handleLogout} />
            </div>
        </header>
    );
};

export default HeaderUser;
