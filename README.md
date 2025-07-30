# Hotel Management System

A comprehensive hotel management system built with Next.js, TypeScript, Prisma, and Tailwind CSS. This application provides a complete solution for managing hotel operations including bookings, rooms, guests, and reviews.

## Features

### 🏨 Core Features
- **User Authentication**: Secure login/register system with JWT tokens
- **Room Management**: Add, edit, and manage hotel rooms with status tracking
- **Booking System**: Complete booking management with check-in/check-out dates
- **Guest Management**: Track guest information and preferences
- **Reviews & Ratings**: Collect and manage guest feedback
- **Dashboard**: Comprehensive overview with key metrics and quick actions

### 🛠 Technical Features
- **Modern Stack**: Next.js 15, TypeScript, Prisma ORM
- **Database**: PostgreSQL with comprehensive schema
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React for consistent iconography

## Database Schema

The system uses a well-structured database with the following main entities:

- **Users**: Staff and guest accounts with role-based access
- **Rooms**: Hotel rooms with types, capacity, pricing, and status
- **Bookings**: Reservations linking users to rooms with dates and status
- **Reviews**: Guest feedback and ratings for rooms

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hotel-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/hotel_management"
   JWT_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed the database with sample data
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
hotel-management/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   └── auth/              # Authentication endpoints
│   │   ├── auth/                   # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/              # Dashboard and management pages
│   │   │   ├── bookings/
│   │   │   ├── rooms/
│   │   │   └── ...
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Landing page
│   └── generated/                 # Generated Prisma client
├── prisma/
│   └── schema.prisma              # Database schema
├── public/                        # Static assets
└── package.json                   # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Rooms (Planned)
- `GET /api/rooms` - List all rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/[id]` - Get room details
- `PUT /api/rooms/[id]` - Update room
- `DELETE /api/rooms/[id]` - Delete room

### Bookings (Planned)
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Cancel booking

## User Roles

- **ADMIN**: Full system access, can manage all aspects
- **STAFF**: Can manage bookings, rooms, and guest information
- **GUEST**: Can view available rooms and make bookings

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Management
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply migrations

## Deployment

### Environment Variables
Ensure the following environment variables are set in production:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `NODE_ENV`: Set to "production"

### Database Setup
1. Create a PostgreSQL database
2. Run `npx prisma db push` to apply the schema
3. Optionally seed the database with initial data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This is a work in progress. Some features are implemented with mock data and will be connected to the database in future updates.
