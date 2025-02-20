import HeaderUser from "../components/Header/HeaderUser";
import TableRole3 from "../components/tables/TableRole3";

const Role1TablePage = () => {
    return (
        <div className="min-h-screen w-screen pt-6 bg-[#e4ebf3]">
            <HeaderUser />
            <div className="mx-auto">
                <TableRole3 />
            </div>
        </div>
    );
};

export default Role1TablePage;
