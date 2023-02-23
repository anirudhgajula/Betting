import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="flex justify-between items-center py-4 ml-4 mr-4">
            <p className="text-2xl font-bold text-gray-200 px-4">BTC/USD Bet</p>
            <div className="flex">
                <Link href="/"
                className="rounded bg-blue-800 text-white py-2 px-4 mr-4"
                >
                    Mint NewToken
                </Link>
                <Link href="/bet"
                className="rounded bg-blue-800 text-white py-2 px-4"
                >
                    Make a Bet
                </Link>
            </div>
        </nav>
    )
}