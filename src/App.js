import React, { useState, useEffect } from 'react';
import { Heart, Star, BookOpen, Award, Send, X, User, UserX, AlertTriangle, Search, Filter, Share2, Flag, Calendar, TrendingUp, MessageCircle, Loader } from 'lucide-react';
import FirebaseService from './services/firebaseService';
import { moderateContent, getSeasonalColors, generateRandomPosition } from './utils/contentModeration';

const TeacherWishingTree = () => {
  // State management
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseService] = useState(() => new FirebaseService());
  const [showWishForm, setShowWishForm] = useState(false);
  const [selectedWish, setSelectedWish] = useState(null);
  const [contentWarning, setContentWarning] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showThankYou, setShowThankYou] = useState(false);
  const [newLeafAnimation, setNewLeafAnimation] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingWish, setReportingWish] = useState(null);
  const [showTeacherResponse, setShowTeacherResponse] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recentWishes, setRecentWishes] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [formData, setFormData] = useState({
    message: '',
    category: 'gratitude',
    author: '',
    isAnonymous: true
  });
const [teacherReplyData, setTeacherReplyData] = useState({
  message: '',
  teacherName: '',
  isAnonymous: true
});

  // Categories with seasonal colors
  const categories = {
    gratitude: { color: getSeasonalColors().gratitude, label: 'Thank You', icon: Heart },
    support: { color: getSeasonalColors().support, label: 'You\'re Amazing', icon: Star },
    inspiration: { color: getSeasonalColors().inspiration, label: 'Keep Going', icon: Award },
    appreciation: { color: getSeasonalColors().appreciation, label: 'Inspiration', icon: BookOpen }
	'teacher-reply': { color: '#3B82F6', label: 'Teacher Response', icon: MessageCircle }
  };

  // Initialize Firebase and load wishes
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      try {
        // Set up real-time listener for wishes
        const unsubscribe = firebaseService.onWishesUpdate((wishesData) => {
          setWishes(wishesData);
          setConnectionStatus('connected');
          setLoading(false);
        });

        // Cleanup function
        return () => unsubscribe();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setConnectionStatus('error');
        setLoading(false);
        
        // Fallback to sample data if Firebase fails
        setWishes([
          {
            id: 1,
            message: "Thank you for making learning fun and inspiring us every day! Your creativity brings lessons to life.",
            category: "gratitude",
            author: "Sarah M.",
            isAnonymous: false,
            ...generateRandomPosition(),
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            hearts: 12,
            isWishOfTheDay: false
          }
        ]);
      }
    };

    initializeApp();
  }, [firebaseService]);

  // Update recent wishes
  useEffect(() => {
    const recent = wishes
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    setRecentWishes(recent);
  }, [wishes]);

  // Floating particles animation
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1
      }));
      setParticles(newParticles);
    };
    generateParticles();
    const interval = setInterval(generateParticles, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle form submission
  const handleSubmitWish = async () => {
    if (!formData.message.trim() || submitting) return;

    const moderationResult = moderateContent(formData.message);
    if (!moderationResult.isValid) {
      setContentWarning(moderationResult.message);
      return;
    }

    setSubmitting(true);
    try {
      const wishData = {
        message: formData.message,
        category: formData.category,
        author: formData.isAnonymous ? 'Anonymous' : (formData.author || 'Anonymous'),
        isAnonymous: formData.isAnonymous,
        ...generateRandomPosition()
      };

      const newWish = await firebaseService.addWish(wishData);
      
      // Trigger new leaf animation
      setNewLeafAnimation(newWish);
      setTimeout(() => setNewLeafAnimation(null), 2000);

      // Reset form
      setFormData({ message: '', category: 'gratitude', author: '', isAnonymous: true });
      setContentWarning('');
      setShowWishForm(false);
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);

    } catch (error) {
      console.error('Error submitting wish:', error);
      alert('Sorry, there was an error submitting your wish. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

// 4. ADD TEACHER REPLY FUNCTION
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

  // Handle heart click
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

// Handle share
  const handleShareWish = (wish) => {
    if (navigator.share) {
      navigator.share({
        title: 'Teacher Appreciation Wish',
        text: `"${wish.message}" - Shared on Teacher Appreciation Wishing Tree`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`"${wish.message}" - Shared on Teacher Appreciation Wishing Tree: ${window.location.href}`);
      alert('Wish copied to clipboard!');
    }
  };

  // Handle report
  const handleReportWish = (wish) => {
    setReportingWish(wish);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    try {
      await firebaseService.reportWish(reportingWish.id, 'inappropriate', '');
      alert('Thank you for reporting. We\'ll review this content.');
      setShowReportModal(false);
      setReportingWish(null);
    } catch (error) {
      console.error('Error reporting wish:', error);
      alert('Error submitting report. Please try again.');
    }
  };

  // Filter wishes
  const filteredWishes = wishes.filter(wish => {
    const matchesSearch = wish.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wish.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || wish.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Statistics
  const stats = {
    total: wishes.length,
    thisWeek: wishes.filter(w => new Date(w.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    byCategory: Object.keys(categories).reduce((acc, cat) => {
      acc[cat] = wishes.filter(w => w.category === cat).length;
      return acc;
    }, {})
  };

  const wishOfTheDay = wishes.find(w => w.isWishOfTheDay);

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Teacher Wishes...</h2>
          <p className="text-gray-500">Gathering all the appreciation from our community</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Floating Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white bg-opacity-30 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.speed}s`
          }}
        />
      ))}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Teacher Appreciation
        </h1>
        <h2 className="text-2xl md:text-3xl text-green-600 mb-2">Wishing Tree</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Share your gratitude and encouragement for the amazing teachers who shape our future. 
        </p>
         <p className="text-gray-600 max-w-2xl mx-auto">
          Click on the leaves to read wishes from others!
        </p> 
        
        
        {/* Wish Counter */}
        <div className="mt-6 flex justify-center items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-red-500" />
            <span>{stats.total} wishes shared</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            <span>{stats.thisWeek} this week</span>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="max-w-md mx-auto mb-4">
        <div className={`flex items-center justify-center gap-2 text-sm rounded-lg py-2 px-4 ${
          connectionStatus === 'connected' 
            ? 'text-green-600 bg-green-50' 
            : connectionStatus === 'error'
            ? 'text-red-600 bg-red-50'
            : 'text-yellow-600 bg-yellow-50'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            connectionStatus === 'connected' 
              ? 'bg-green-500' 
              : connectionStatus === 'error'
              ? 'bg-red-500'
              : 'bg-yellow-500'
          }`}></div>
          <span>
            {connectionStatus === 'connected' && 'Connected - Wishes are being shared in real-time!'}
            {connectionStatus === 'error' && 'Offline mode - Wishes will sync when reconnected'}
            {connectionStatus === 'connecting' && 'Connecting to wishing tree...'}
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-md mx-auto mb-8 space-y-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search wishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {Object.entries(categories).map(([key, category]) => (
              <option key={key} value={key}>{category.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rest of the component remains the same as the previous version... */}
      {/* I'll continue with the tree visualization and modals in the same structure */}
      
      {/* Wish of the Day */}
      {wishOfTheDay && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center gap-2 mb-2">
            <Star size={20} className="text-yellow-600" />
            <h3 className="font-bold text-yellow-800">Wish of the Day</h3>
          </div>
          <p className="text-yellow-900 italic">"{wishOfTheDay.message}"</p>
          <p className="text-yellow-700 text-sm mt-2">— {wishOfTheDay.author}</p>
        </div>
      )}

      {/* Recent Wishes Ticker */}
      {recentWishes.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-center text-gray-600 mb-4 flex items-center justify-center gap-2">
            <MessageCircle size={16} />
            Recent Wishes
          </h3>
          <div className="overflow-hidden bg-white bg-opacity-50 rounded-lg p-4">
            <div className="animate-marquee whitespace-nowrap">
              {recentWishes.map((wish, index) => (
                <span key={wish.id} className="inline-block mr-12 text-gray-700">
                  "{wish.message.slice(0, 50)}..." — {wish.author}
                  {index < recentWishes.length - 1 && " • "}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="max-w-2xl mx-auto mb-8 bg-white bg-opacity-50 rounded-lg p-4">
        <h3 className="text-center font-semibold text-gray-700 mb-3">This Week's Wishes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          {Object.entries(categories).map(([key, category]) => (
            <div key={key}>
              <div className="text-2xl font-bold" style={{ color: category.color }}>
                {stats.byCategory[key] || 0}
              </div>
              <div className="text-gray-600">{category.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wishing Tree Container */}
      <div className="relative max-w-5xl mx-auto">
        {/* Tree Trunk */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 md:w-24 h-32 md:h-48 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-3xl shadow-lg">
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-700 to-transparent rounded-t-3xl"></div>
          </div>
        </div>

        {/* Tree Crown */}
        <div className="relative w-full h-96 md:h-[500px]">
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-80 md:w-96 h-80 md:h-96 bg-gradient-to-b from-green-400 to-green-600 rounded-full opacity-90 shadow-2xl"></div>
          <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 translate-x-8 w-64 md:w-80 h-64 md:h-80 bg-gradient-to-b from-green-300 to-green-500 rounded-full opacity-80"></div>
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 -translate-x-8 w-64 md:w-72 h-64 md:h-72 bg-gradient-to-b from-green-500 to-green-700 rounded-full opacity-85"></div>

          {/* Wishes as Leaves */}
          {filteredWishes.map((wish, index) => {
            const category = categories[wish.category];
            const isNewLeaf = newLeafAnimation?.id === wish.id;
            return (
              <div
                key={wish.id}
                className={`absolute cursor-pointer transform hover:scale-125 transition-all duration-500 ${isNewLeaf ? 'animate-bounce' : 'animate-pulse hover:animate-none'}`}
                style={{
                  left: `${wish.x}%`,
                  top: `${wish.y}%`,
                  transform: `rotate(${wish.rotation}deg)`,
                  animationDelay: `${index * 0.3}s`,
                  animationDuration: `${3 + (index % 3)}s`
                }}
                onClick={() => setSelectedWish(wish)}
              >
                <div 
                  className="relative w-8 h-8 md:w-12 md:h-12 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white transform rotate-45"
                  style={{ 
			backgroundColor: category.color,
			borderRadius: '50% 0 50% 0'
    			
		}}
                >
                  <div className="transform -rotate-45">
                    {React.createElement(category.icon, { size: index % 2 === 0 ? 16 : 20 })}
                  </div>
                  {/*<div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-green-800"></div>*/}
                  
                  {/* Heart counter */}
                  {wish.hearts > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transform -rotate-45">
                      {wish.hearts}
                    </div>
                  )}
                  
                  {/* Wish of the day indicator */}
                  {wish.isWishOfTheDay && (
                    <div className="absolute -top-1 -left-1 text-yellow-400 transform -rotate-45">
                      <Star size={12} fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Decorative birds */}
          <div className="absolute top-8 left-16 opacity-60 animate-bounce" style={{ animationDuration: '4s' }}>
            <div className="text-2xl">🐦</div>
          </div>
          <div className="absolute top-12 right-20 opacity-60 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
            <div className="text-xl">🐦</div>
          </div>

          <div className="absolute bottom-8 left-8 opacity-40">
            <BookOpen size={32} className="text-amber-600" />
          </div>
          <div className="absolute bottom-12 right-8 opacity-40">
            <Star size={28} className="text-yellow-500" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-200 to-transparent rounded-b-full"></div>
      </div>

      {/* Action Buttons */}
      <div className="text-center mt-12 space-y-4">
        <button
          onClick={() => setShowWishForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 mx-auto"
        >
          <Heart size={24} />
          Add a Wish Leaf
        </button>
        
        <button
          onClick={() => setShowTeacherResponse(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          <MessageCircle size={20} />
          Teacher Response Area
        </button>
      </div>

      {/* Legend */}
      <div className="mt-12 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Leaf Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categories).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <div key={key} className="flex items-center gap-2 justify-center">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center transform rotate-45"
                  style={{ backgroundColor: category.color }}
                >
                  <div className="transform -rotate-45">
                    <Icon size={14} className="text-white" />
                  </div>
                </div>
                <span className="text-gray-600 text-sm">{category.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 mb-8 text-center">
        <p className="text-gray-500 text-sm">
          By{' '}
          <a 
            href="https://www.instagram.com/teacherstogether_sg" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
          >
            TeachersTogether
          </a>
        </p>
      </div>

      {/* Thank You Animation Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-pulse">
            <div className="text-6xl mb-4">🌿</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your wish leaf has been added to the tree!</p>
            <div className="mt-4 text-sm text-gray-500">Spreading kindness to teachers everywhere ✨</div>
            <div className="mt-2 text-xs text-blue-500">Everyone can now see your beautiful wish!</div>
          </div>
        </div>
      )}

      {/* Wish Form Modal */}
      {showWishForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-green-600">Share Your Appreciation</h3>
                <button
                  onClick={() => {
                    setShowWishForm(false);
                    setContentWarning('');
                    setFormData({ message: '', category: 'gratitude', author: '', isAnonymous: true });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a category:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(categories).map(([key, category]) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setFormData({ ...formData, category: key })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.category === key
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: category.color }}
                            >
                              <Icon size={14} className="text-white" />
                            </div>
                            <span className="text-sm font-medium">{category.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your message to teachers:
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Share your gratitude, encouragement, or appreciation..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={300}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/300 characters
                  </div>
                </div>

                {/* Author Settings */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="anonymous" className="text-sm text-gray-700">
                      Share anonymously
                    </label>
                  </div>
                  
                  {!formData.isAnonymous && (
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Your name (optional)"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      maxLength={50}
                    />
                  )}
                </div>

                {/* Content Warning */}
                {contentWarning && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle size={16} />
                      <span className="text-sm font-medium">Content Warning</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{contentWarning}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmitWish}
                  disabled={!formData.message.trim() || submitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Adding to tree...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Add My Wish to the Tree
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Wish Modal */}
      {selectedWish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transform rotate-45"
                    style={{ backgroundColor: categories[selectedWish.category].color }}
                  >
                    <div className="transform -rotate-45">
                      {React.createElement(categories[selectedWish.category].icon, { size: 18 })}
                    </div>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {categories[selectedWish.category].label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedWish(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <blockquote className="text-lg text-gray-800 italic">
                  "{selectedWish.message}"
                </blockquote>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{selectedWish.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{new Date(selectedWish.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleHeartWish(selectedWish.id)}
                    className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Heart size={16} className={selectedWish.hearts > 0 ? 'fill-red-500 text-red-500' : 'text-red-500'} />
                    <span>{selectedWish.hearts || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => handleShareWish(selectedWish)}
                    className="flex items-center gap-2 px-3 py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                  
                  <button
                    onClick={() => handleReportWish(selectedWish)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors ml-auto"
                  >
                    <Flag size={16} />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 			rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
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

      {/* Report Modal */}
      {showReportModal && reportingWish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-600">Report Content</h3>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportingWish(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Help us maintain a positive environment. If you believe this content 
                  is inappropriate, please report it for review.
                </p>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 text-sm italic">"{reportingWish.message}"</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportingWish(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReport}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWishingTree;
