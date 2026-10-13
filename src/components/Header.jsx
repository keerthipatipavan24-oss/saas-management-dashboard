import "./Header.css";

export default function Header({ pageTitle }) {
    return (
        <header className="top-header">
            <div className="header-left">
                <h1>{pageTitle}</h1>
            </div>

            <div className="header-search">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search..." />
            </div>

            <div className="header-profile">
                <div className="profile-icon">👤</div>

                <div className="profile-info">
                    <strong>Pavan</strong>
                    <span>Admin</span>
                </div>
            </div>
        </header>
    )
} 