export default function NavBar() {
    return (
        <nav className="flex justify-between items-center py-4 ml-4 mr-4">
            <p className="text-2xl font-bold text-grey-800">BTC/USD Bet</p>
            <div className="flex">
                <a href="/"
                className="rounded bg-blue-800 text-white py-2 px-4 mr-4"
                >
                    Mint NewToken
                </a>
                <a href="/bet"
                className="rounded bg-blue-800 text-white py-2 px-4"
                >
                    Make a Bet
                </a>
            </div>
        </nav>
    )
}