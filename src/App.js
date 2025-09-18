// 1. FIX THE LEAF SHAPE (around line 357)
// REPLACE this line:
// className="relative w-8 h-8 md:w-12 md:h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white transform rotate-45"

// WITH this (remove rounded-full):
className="relative w-8 h-8 md:w-12 md:h-12 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white transform rotate-45"

// 2. FIX THE HEART FUNCTION (around line 112)
// REPLACE the entire handleHeartWish function with:
const handleHeartWish = async (wishId) => {
  try {
    // Optimistically update the UI first for immediate feedback
    setWishes(prevWishes => 
      prevWishes.map(wish => 
        wish.id === wishId 
          ? { ...wish, hearts: (wish.hearts || 0) + 1 }
          : wish
      )
    );
    
    // Also update the selected wish if it's the one being hearted
    if (selectedWish && selectedWish.id === wishId) {
      setSelectedWish(prevSelected => ({
        ...prevSelected,
        hearts: (prevSelected.hearts || 0) + 1
      }));
    }
    
    // Then update Firebase
    await firebaseService.updateWishHearts(wishId);
  } catch (error) {
    console.error('Error updating hearts:', error);
    // Revert the optimistic update if Firebase fails
    setWishes(prevWishes => 
      prevWishes.map(wish => 
        wish.id === wishId 
          ? { ...wish, hearts: (wish.hearts || 0) - 1 }
          : wish
      )
    );
    
    if (selectedWish && selectedWish.id === wishId) {
      setSelectedWish(prevSelected => ({
        ...prevSelected,
        hearts: (prevSelected.hearts || 0) - 1
      }));
    }
  }
};

// 3. ADD NEW STATE FOR TEACHER REPLIES (add this to your state section around line 24)
const [teacherReplyData, setTeacherReplyData] = useState({
  message: '',
  teacherName: '',
  isAnonymous: true
});

// 4. ADD TEACHER REPLY FUNCTION (add this after handleSubmitWish function)
const handleSubmitTeacherReply = async () => {
  if (!teacherReplyData.message.trim()) return;

  try {
    const replyData = {
      message: teacherReplyData.message,
      category: 'teacher-reply',
      author: teacherReplyData.isAnonymous ? 'Teacher' : (teacherReplyData.teacherName || 'Teacher'),
      isAnonymous: teacherReplyData.isAnonymous,
      isTeacherReply: true,
      ...generateRandomPosition()
    };

    await firebaseService.addWish(replyData);
    
    // Reset form
    setTeacherReplyData({ message: '', teacherName: '', isAnonymous: true });
    setShowTeacherResponse(false);
    
    // Show success message
    alert('Thank you for your response! Your message has been added to the tree.');
    
  } catch (error) {
    console.error('Error submitting teacher reply:', error);
    alert('Sorry, there was an error submitting your reply. Please try again.');
  }
};

// 5. REPLACE THE ENTIRE TEACHER RESPONSE MODAL with this enhanced version:
{/* Teacher Response Modal */}
{showTeacherResponse && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-blue-600">Teacher Response Center</h3>
          <button
            onClick={() => {
              setShowTeacherResponse(false);
              setTeacherReplyData({ message: '', teacherName: '', isAnonymous: true });
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">For Teachers</h4>
            <p className="text-blue-700 text-sm">
              Thank you for all that you do! Here you can view appreciation messages 
              and share your own responses with the community.
            </p>
          </div>

          {/* Teacher Reply Form */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">Share Your Response</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your message to students and parents:
                </label>
                <textarea
                  value={teacherReplyData.message}
                  onChange={(e) => setTeacherReplyData({ ...teacherReplyData, message: e.target.value })}
                  placeholder="Thank your students, share encouragement, or express gratitude to the community..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={300}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {teacherReplyData.message.length}/300 characters
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="teacher-anonymous"
                    checked={teacherReplyData.isAnonymous}
                    onChange={(e) => setTeacherReplyData({ ...teacherReplyData, isAnonymous: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="teacher-anonymous" className="text-sm text-gray-700">
                    Post as "Teacher" (anonymous)
                  </label>
                </div>
                
                {!teacherReplyData.isAnonymous && (
                  <input
                    type="text"
                    value={teacherReplyData.teacherName}
                    onChange={(e) => setTeacherReplyData({ ...teacherReplyData, teacherName: e.target.value })}
                    placeholder="Your name (optional)"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    maxLength={50}
                  />
                )}
              </div>

              <button
                onClick={handleSubmitTeacherReply}
                disabled={!teacherReplyData.message.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Share Response
              </button>
            </div>
          </div>

          {/* Recent wishes for teachers */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Recent Appreciation Messages</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {recentWishes.slice(0, 5).map((wish) => (
                <div key={wish.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 text-sm italic">"{wish.message}"</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>— {wish.author}</span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} className="text-red-400" />
                      {wish.hearts || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Spread the Joy</h4>
            <p className="text-blue-700 text-sm mb-3">
              Share this appreciation tree with your fellow educators!
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied! Share with other teachers.');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Copy Tree Link
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

// 6. FIX THE HEART DISPLAY IN SELECTED WISH MODAL (around line 631)
// REPLACE this line:
// <Heart size={16} className={selectedWish.hearts > 0 ? 'fill-current' : ''} />

// WITH this:
<Heart size={16} className={selectedWish.hearts > 0 ? 'fill-red-500 text-red-500' : 'text-red-500'} />

// 7. ADD TEACHER CATEGORY TO YOUR CATEGORIES (around line 31)
// ADD this after the existing categories:
const categories = {
  gratitude: { color: getSeasonalColors().gratitude, label: 'Thank You', icon: Heart },
  support: { color: getSeasonalColors().support, label: 'You\'re Amazing', icon: Star },
  inspiration: { color: getSeasonalColors().inspiration, label: 'Keep Going', icon: Award },
  appreciation: { color: getSeasonalColors().appreciation, label: 'Inspiration', icon: BookOpen },
  'teacher-reply': { color: '#3B82F6', label: 'Teacher Response', icon: MessageCircle } // Add this line
};