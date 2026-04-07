import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useGetLeaderboard } from '../hooks/useQueries';

export default function LeaderboardPage() {
  const { data: leaderboard = [] } = useGetLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-secondary" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return (
        <Badge variant="secondary" className="text-lg px-3 py-1">
          #{rank}
        </Badge>
      );
    }
    return <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Top players ranked by performance</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                <Medal className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-center">
                <div className="font-semibold">Player #{leaderboard[1].user.toString().slice(-4)}</div>
                <div className="text-2xl font-bold text-primary">{leaderboard[1].score.toString()}</div>
                <Badge variant="secondary" className="mt-2">2nd</Badge>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mb-2">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold">Player #{leaderboard[0].user.toString().slice(-4)}</div>
                <div className="text-3xl font-bold text-primary">{leaderboard[0].score.toString()}</div>
                <Badge className="mt-2 gradient-gold text-white border-0">1st</Badge>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-8">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-center">
                <div className="font-semibold">Player #{leaderboard[2].user.toString().slice(-4)}</div>
                <div className="text-2xl font-bold text-primary">{leaderboard[2].score.toString()}</div>
                <Badge variant="secondary" className="mt-2">3rd</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>All Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user.toString()}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(Number(entry.rank)) || getRankBadge(Number(entry.rank))}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {entry.user.toString().slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">Player #{entry.user.toString().slice(-8)}</div>
                    <div className="text-sm text-muted-foreground">Rank #{entry.rank.toString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{entry.score.toString()}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </div>
            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Rankings Yet</h3>
                <p className="text-muted-foreground">Be the first to compete and climb the leaderboard!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
