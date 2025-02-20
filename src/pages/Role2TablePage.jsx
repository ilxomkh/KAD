import HeaderUser from "../components/Header/HeaderUser";
import TableRole2 from "../components/tables/TableRole2";

const Role1TablePage = () => {
    return (
        <div className="min-h-screen w-screen pt-6 bg-[#e4ebf3]">
            <HeaderUser />
            <div className="mx-auto">
                <TableRole2 />
            </div>
        </div>
    );
};

export default Role1TablePage;
