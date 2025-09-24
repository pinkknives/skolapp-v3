'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/ui/DataTable'
import { BarChartComponent, LineChartComponent, PieChartComponent } from '@/components/ui/Chart'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { toast } from '@/components/ui/Toast'
import { ColumnDef } from '@tanstack/react-table'
import { 
  Info, 
  Settings, 
        // Education & Learning
        GraduationCap,
        BookOpen,
        PenTool,
        Calculator,
        Microscope,
        Globe,
  // Assessment & Quiz
  ClipboardCheck, 
  Target, 
  Award, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
        // Navigation & Actions
        Home,
        ArrowLeft,
        ArrowRight,
  // Status & Feedback
  Check, 
  X, 
  Plus, 
  Minus, 
        Edit,
        Save,
        Download,
        // Communication
        MessageCircle,
        Bell,
} from 'lucide-react'

// HeroUI imports
import { 
  Button as HeroButton,
  Input as HeroInput,
  Textarea as HeroTextarea,
  Select,
  SelectItem,
  RadioGroup,
  Radio,
  Checkbox,
  Switch,
  Snippet,
  User,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Kbd
} from '@heroui/react'
import Link from 'next/link'

// Sample data for charts
const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'Maj', value: 500 },
  { name: 'Jun', value: 700 },
]

const pieData = [
  { name: 'Korrekta svar', value: 75 },
  { name: 'Felaktiga svar', value: 25 },
]

// Sample data for table
const tableData = [
  { id: 1, name: 'Anna Andersson', score: 85, grade: 'VG' },
  { id: 2, name: 'Erik Eriksson', score: 92, grade: 'MVG' },
  { id: 3, name: 'Maria Svensson', score: 78, grade: 'G' },
  { id: 4, name: 'Johan Johansson', score: 95, grade: 'MVG' },
  { id: 5, name: 'Lisa Larsson', score: 88, grade: 'VG' },
]

const columns: ColumnDef<typeof tableData[0]>[] = [
  {
    accessorKey: 'name',
    header: 'Namn',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'score',
    header: 'Poäng',
    cell: (info) => `${info.getValue()}%`,
  },
  {
    accessorKey: 'grade',
    header: 'Betyg',
    cell: (info) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        info.getValue() === 'MVG' ? 'bg-success-100 text-success-800' :
        info.getValue() === 'VG' ? 'bg-primary-100 text-primary-800' :
        'bg-neutral-100 text-neutral-800'
      }`}>
        {String(info.getValue())}
      </span>
    ),
  },
]

export default function ComponentTestPage() {
  const [inputValue, setInputValue] = useState('')

  const handleToast = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        toast.success('Operation lyckades!')
        break
      case 'error':
        toast.error('Något gick fel')
        break
      case 'info':
        toast.info('Detta är en information')
        break
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground">Komponenttest</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Test av alla UI-komponenter och bibliotek
          </p>
        </div>

        {/* Toast Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Toast Notifications (Sonner)</CardTitle>
            <CardDescription>Testa olika typer av notiser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => handleToast('success')}>
                Success Toast
              </Button>
              <Button variant="destructive" onClick={() => handleToast('error')}>
                Error Toast
              </Button>
              <Button variant="outline" onClick={() => handleToast('info')}>
                Info Toast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dialog Test */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog (Radix)</CardTitle>
            <CardDescription>Modal dialoger med tillgänglighet</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Öppna Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exempel Dialog</DialogTitle>
                  <DialogDescription>
                    Detta är en exempel-dialog som visar hur Radix Dialog fungerar.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    label="Namn"
                    placeholder="Skriv ditt namn"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Avbryt</Button>
                    <Button>Spara</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Tooltip Test */}
        <Card>
          <CardHeader>
            <CardTitle>Tooltip (Radix)</CardTitle>
            <CardDescription>Hover för att se tooltips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <Info className="h-4 w-4 mr-2" />
                    Hover för tooltip
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Detta är en tooltip!</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost">
                    <Settings className="h-4 w-4 mr-2" />
                    Inställningar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Klicka för att öppna inställningar</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <DataTable
          data={tableData}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Sök efter elev..."
          title="Elevresultat"
          description="Tabell med sortering och filtrering"
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartComponent
            data={chartData}
            title="Månadsvisa resultat"
            description="Stapeldiagram över elevprestationer"
          />
          
          <LineChartComponent
            data={chartData}
            title="Utveckling över tid"
            description="Linjediagram som visar trend"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartComponent
            data={pieData}
            title="Svarfördelning"
            description="Cirkeldiagram över korrekta/felaktiga svar"
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Tremor Dashboard</CardTitle>
              <CardDescription>Dashboard-komponenter kommer här</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Tremor-komponenter kan implementeras här för dashboards
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HeroUI Components Demo */}
        <Card>
          <CardHeader>
            <CardTitle>HeroUI Components</CardTitle>
            <CardDescription>HeroUI-komponenter för formulär, navigation och interaktion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Form Components */}
          <div>
                <h4 className="text-lg font-semibold mb-4">Formulär-komponenter</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Input</label>
                    <HeroInput
                      label="E-postadress"
                      placeholder="Ange din e-post"
                      type="email"
                      variant="bordered"
            />
          </div>

                  {/* Textarea */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Textarea</label>
                    <HeroTextarea
                      label="Beskrivning"
                      placeholder="Beskriv ditt quiz..."
                      variant="bordered"
                      minRows={3}
            />
          </div>

                  {/* Select */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select</label>
                    <Select
                      label="Välj ämne"
                      placeholder="Välj ett ämne"
                      variant="bordered"
                    >
                      <SelectItem key="matematik">Matematik</SelectItem>
                      <SelectItem key="svenska">Svenska</SelectItem>
                      <SelectItem key="engelska">Engelska</SelectItem>
                      <SelectItem key="naturvetenskap">Naturvetenskap</SelectItem>
                    </Select>
                  </div>

                </div>
              </div>

              {/* Checkbox and Switch */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Kontroller</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Checkboxes</label>
                    <div className="space-y-2">
                      <Checkbox defaultSelected>Blanda frågorna</Checkbox>
                      <Checkbox>Blanda svarsalternativen</Checkbox>
                      <Checkbox defaultSelected>Visa korrekta svar efter inlämning</Checkbox>
                      <Checkbox isDisabled>Inaktiverad checkbox</Checkbox>
                    </div>
                  </div>

                  {/* Switches */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Switches</label>
                    <div className="space-y-2">
                      <Switch defaultSelected>AI-assistent aktiverad</Switch>
                      <Switch>E-postnotifieringar</Switch>
                      <Switch defaultSelected>Mörkt tema</Switch>
                      <Switch isDisabled>Inaktiverad switch</Switch>
                    </div>
                  </div>
                </div>
              </div>

              {/* Radio Groups */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Radio Groups</h4>
                <div className="space-y-4">
                  <RadioGroup
                    label="Genomförandeläge"
                    defaultValue="self-paced"
                    orientation="vertical"
                  >
                    <Radio value="self-paced">Självtempo</Radio>
                    <Radio value="teacher-controlled">Lärarstyrt tempo</Radio>
                    <Radio value="teacher-review">Lärargranskningsläge</Radio>
                  </RadioGroup>
                </div>
              </div>

              {/* Buttons */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <HeroButton color="primary">Primary</HeroButton>
                  <HeroButton color="secondary">Secondary</HeroButton>
                  <HeroButton color="success">Success</HeroButton>
                  <HeroButton color="warning">Warning</HeroButton>
                  <HeroButton color="danger">Danger</HeroButton>
                  <HeroButton variant="bordered">Bordered</HeroButton>
                  <HeroButton variant="light">Light</HeroButton>
                  <HeroButton variant="flat">Flat</HeroButton>
                  <HeroButton variant="faded">Faded</HeroButton>
                  <HeroButton variant="shadow">Shadow</HeroButton>
                  <HeroButton variant="ghost">Ghost</HeroButton>
                </div>
              </div>

              {/* Dropdown */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Dropdown</h4>
                <Dropdown>
                  <DropdownTrigger>
                    <HeroButton variant="bordered">
                      Öppna meny
                    </HeroButton>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Static Actions">
                    <DropdownItem key="new">Nytt quiz</DropdownItem>
                    <DropdownItem key="copy">Kopiera</DropdownItem>
                    <DropdownItem key="edit">Redigera</DropdownItem>
                    <DropdownItem key="delete" className="text-danger" color="danger">
                      Radera
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>

              {/* Snippet */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Snippet</h4>
                <div className="space-y-2">
                  <Snippet symbol="" variant="bordered">
                    npm install @heroui/react
                  </Snippet>
                  <Snippet symbol="$" variant="flat" color="primary">
                    npx create-next-app@latest my-app
                  </Snippet>
                </div>
              </div>

              {/* User */}
              <div>
                <h4 className="text-lg font-semibold mb-4">User</h4>
                <div className="flex gap-4">
                  <User
                    name="Anna Andersson"
                    description="Lärare"
                    avatarProps={{
                      src: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
                    }}
                  />
                  <User
                    name="Erik Eriksson"
                    description="Elev"
                    avatarProps={{
                      src: "https://i.pravatar.cc/150?u=a04258a2462d826712d"
                    }}
                  />
                </div>
              </div>

              {/* Kbd */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h4>
                <div className="flex gap-2">
                  <Kbd keys={["command"]}>K</Kbd>
                  <Kbd keys={["command", "shift"]}>N</Kbd>
                  <Kbd keys={["alt"]}>F4</Kbd>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lucide Icons Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Lucide Icons</CardTitle>
            <CardDescription>Utbildningsspecifika ikoner och vanliga UI-ikoner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Education & Learning Icons */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Utbildning & Lärande</h4>
                <div className="grid grid-cols-6 gap-4">
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <GraduationCap size={24} className="text-primary-600" />
                    <span className="text-xs text-center">GraduationCap</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <BookOpen size={24} className="text-primary-600" />
                    <span className="text-xs text-center">BookOpen</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <PenTool size={24} className="text-primary-600" />
                    <span className="text-xs text-center">PenTool</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Calculator size={24} className="text-primary-600" />
                    <span className="text-xs text-center">Calculator</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Microscope size={24} className="text-primary-600" />
                    <span className="text-xs text-center">Microscope</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Globe size={24} className="text-primary-600" />
                    <span className="text-xs text-center">Globe</span>
                  </div>
                </div>
              </div>

              {/* Assessment & Quiz Icons */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Bedömning & Quiz</h4>
                <div className="grid grid-cols-6 gap-4">
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <ClipboardCheck size={24} className="text-success-600" />
                    <span className="text-xs text-center">ClipboardCheck</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Target size={24} className="text-success-600" />
                    <span className="text-xs text-center">Target</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Award size={24} className="text-warning-600" />
                    <span className="text-xs text-center">Award</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Star size={24} className="text-warning-600" />
                    <span className="text-xs text-center">Star</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <ThumbsUp size={24} className="text-success-600" />
                    <span className="text-xs text-center">ThumbsUp</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <ThumbsDown size={24} className="text-error-600" />
                    <span className="text-xs text-center">ThumbsDown</span>
                  </div>
                </div>
              </div>

              {/* Navigation & Actions */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Navigation & Åtgärder</h4>
                <div className="grid grid-cols-6 gap-4">
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Home size={24} className="text-neutral-600" />
                    <span className="text-xs text-center">Home</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <ArrowLeft size={24} className="text-neutral-600" />
                    <span className="text-xs text-center">ArrowLeft</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <ArrowRight size={24} className="text-neutral-600" />
                    <span className="text-xs text-center">ArrowRight</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Edit size={24} className="text-primary-600" />
                    <span className="text-xs text-center">Edit</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Save size={24} className="text-success-600" />
                    <span className="text-xs text-center">Save</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Download size={24} className="text-primary-600" />
                    <span className="text-xs text-center">Download</span>
                  </div>
                </div>
              </div>

              {/* Status & Feedback */}
          <div>
                <h4 className="text-lg font-semibold mb-4">Status & Feedback</h4>
                <div className="grid grid-cols-6 gap-4">
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Check size={24} className="text-success-600" />
                    <span className="text-xs text-center">Check</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <X size={24} className="text-error-600" />
                    <span className="text-xs text-center">X</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Plus size={24} className="text-primary-600" />
                    <span className="text-xs text-center">Plus</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Minus size={24} className="text-neutral-600" />
                    <span className="text-xs text-center">Minus</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <Bell size={24} className="text-warning-600" />
                    <span className="text-xs text-center">Bell</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 p-3 rounded-lg border">
                    <MessageCircle size={24} className="text-primary-600" />
                    <span className="text-xs text-center">MessageCircle</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Framer Motion Animationer</CardTitle>
            <CardDescription>Test av animationer och övergångar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Framer Motion används redan i applikationen för smooth animationer.
                Se hem-sidan för exempel på animerade komponenter.
              </p>
              <Button asChild>
                <Link href="/">Gå till hem-sida för animationer</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
  )
}