export default function RoomPage({ params }: { params: { roomId: string } }) {
    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                {/* Room Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Room: {params.roomId}</h1>
                        <button className="text-blue-500 hover:underline">
                            Copy Link
                        </button>
                    </div>

                    <p className="text-gray-600">Share this room ID with your friends to join</p>
                </div>

                {/* Players List */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Players</h2>

                    {/* Player list will go here */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium">Player 1</span>
                            <span className="text-sm text-green-600">Ready</span>
                        </div>
                    </div>
                </div>

                {/* Ready Button */}
                <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold">
                    Ready
                </button>
            </div>
        </main>
    );
}