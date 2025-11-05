"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ReviewsSectionProps {
  productId: number
  productRating: number
  productReviews: number
}

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    author: "John Doe",
    rating: 5,
    date: "2 weeks ago",
    title: "Excellent quality!",
    content:
      "These headphones are amazing! The sound quality is crystal clear and the noise cancellation works perfectly.",
    images: ["/wireless-headphones.png"],
    helpful: 24,
  },
  {
    id: 2,
    author: "Sarah Smith",
    rating: 4,
    date: "1 month ago",
    title: "Great product, minor issues",
    content:
      "Very comfortable to wear for long periods. Battery life is as advertised. Only minor complaint is the case could be better.",
    images: [],
    helpful: 18,
  },
  {
    id: 3,
    author: "Mike Johnson",
    rating: 5,
    date: "1 month ago",
    title: "Best purchase ever",
    content: "Worth every penny. The build quality is premium and it sounds incredible. Highly recommend!",
    images: ["/wireless-headphones.png", "/wireless-headphones.png"],
    helpful: 32,
  },
]

export function ReviewsSection({ productId, productRating, productReviews }: ReviewsSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    content: "",
  })

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    // Call your backend API to submit review
    console.log("Submitting review:", reviewData)
    setReviewData({ rating: 5, title: "", content: "" })
    setShowReviewForm(false)
  }

  return (
    <div className="space-y-8 py-8 border-t border-border">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-foreground mb-2">{productRating}</p>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(productRating) ? "text-yellow-400" : "text-muted-foreground"}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Based on {productReviews} reviews</p>
          </Card>

          {/* Rating Distribution */}
          <div className="md:col-span-2 space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-12">{stars} ★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.random() * 100}%` }}></div>
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{Math.floor(Math.random() * 50)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        {!showReviewForm && (
          <Button
            onClick={() => setShowReviewForm(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground mb-8"
          >
            Write a Review
          </Button>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Share Your Experience</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-3xl transition-colors ${
                        star <= reviewData.rating ? "text-yellow-400" : "text-muted-foreground"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Review Title</label>
                <Input
                  type="text"
                  placeholder="Summarize your experience"
                  value={reviewData.title}
                  onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Review</label>
                <textarea
                  placeholder="Share your detailed experience with this product"
                  value={reviewData.content}
                  onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Submit Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {mockReviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{review.author}</p>
                  <p className="text-sm text-muted-foreground">{review.date}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? "text-yellow-400" : "text-muted-foreground"}>
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
              <p className="text-muted-foreground mb-4">{review.content}</p>

              {/* Review Images */}
              {review.images.length > 0 && (
                <div className="flex gap-3 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Review ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Helpful */}
              <div className="flex items-center gap-4 text-sm">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  👍 Helpful ({review.helpful})
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  👎 Not Helpful
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
