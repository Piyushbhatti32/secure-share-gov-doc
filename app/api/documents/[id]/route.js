import { NextResponse } from 'next/server';

// Simple in-memory storage for server-side (in production, use a database)
let documents = [];

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const document = documents.find(doc => doc.id === id);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const documentIndex = documents.findIndex(doc => doc.id === id);

    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    documents[documentIndex] = {
      ...documents[documentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      document: documents[documentIndex]
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const documentIndex = documents.findIndex(doc => doc.id === id);

    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const deletedDocument = documents.splice(documentIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      document: deletedDocument
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
