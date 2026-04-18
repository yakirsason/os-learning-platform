import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>פלטפורמה אינטראקטיבית</span>
        </div>
        <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-slate-50 md:text-4xl">
          ברוך הבא לפלטפורמת הלמידה של מערכות הפעלה
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
          כאן תוכל ללמוד את נושאי הליבה של מערכות הפעלה בעזרת הדמיות ויזואליות,
          אנימציות והסברים אינטראקטיביים בעברית. כל הרצאה מציגה מושג מרכזי בליווי
          דוגמאות חיות שניתן להתנסות בהן.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>איך מתחילים?</CardTitle>
          <CardDescription>
            תוכני ההרצאות מופיעים בתפריט בצד ימין. בחר הרצאה כדי להיכנס אליה.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link to="/lecture/introduction">
              <span>התחל בהרצאה הראשונה</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            או בחר הרצאה מהתפריט
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
