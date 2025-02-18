import HeaderUser from "../components/Header/HeaderUser";
import TableRole1 from "../components/tables/TableRole1";

const Role1TablePage = () => {
    return (
        <div className="min-h-screen pt-6 bg-[#e4ebf3]">
            <HeaderUser />
            <div className="mx-auto">
                <TableRole1 />
            </div>
        </div>
    );
};

export default Role1TablePage;
