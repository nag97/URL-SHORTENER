import {Link} from "react-router-dom"


const Header = () => {
  return(
    <nav>
      <Link>
       <img src="/logo.png" className="h-16" alt="Trimmr logo" />
      </Link>
      <div></div>
    </nav>
  )
}

export default Header;