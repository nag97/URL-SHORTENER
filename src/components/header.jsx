import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"

const Header = () => {
  const navigate = useNavigate()

  return (
    <nav className="flex justify-between items-center max-w-7xl mx-auto px-4 py-4">
      <Link to="/">
        <img src="/logo.png" className="h-16" alt="Trimmr logo" />
      </Link>

      <Button onClick={() => navigate("/auth")}>Login</Button>
    </nav>
  )
}

export default Header